from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.shortcuts import render
from django.urls import reverse
from .forms import PostForm
from django.contrib.auth.decorators import login_required
from django.core.paginator import Paginator
import json
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger



from .models import User,Post,Likes,Follow





#index for pagination
def index(request):
    form = PostForm()
    all_posts = Post.objects.all().order_by("-id")  # Reverse order by id to show the latest posts first

    paginator = Paginator(all_posts, 10)  # Paginate posts with 10 posts per page
    page = request.GET.get('page')  # Get the current page number from the request

    try:
        posts = paginator.page(page)
    except PageNotAnInteger:
        # If page is not an integer, deliver the first page
        posts = paginator.page(1)
    except EmptyPage:
        # If page is out of range (e.g., 9999), deliver the last page
        posts = paginator.page(paginator.num_pages)

    return render(request, "network/index.html", {
        "form": form,
        "posts": posts
    })











    


def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "network/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "network/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "network/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "network/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "network/register.html")
    

def create_post(request):
    form= PostForm(request.POST)
    if form.is_valid:
        post= form.save(commit=False)
        post.user= request.user
        post.save()

        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "network/index.html")
    





def like_post(request, post_id):
    if request.method == 'PUT':
        post = Post.objects.get(pk=post_id)
        user = request.user

        try:
            # Check if the user already liked the post
            like = Likes.objects.get(user=user, post=post)
            like.delete()  # User unlikes the post
            liked = False
            if post.like_count > 0:
                post.like_count -= 1
        except Likes.DoesNotExist:
            # User is liking the post
            Likes.objects.create(user=user, post=post)
            liked = True
            post.like_count += 1
        
        post.save()


        return JsonResponse({'liked': liked, 'like_count': post.like_count})


def get_initial_like_data(request):

    # Query the database to retrieve initial like data for all posts
    initial_like_data = []
    likes = Likes.objects.all()
    
    for like in likes:
        liked = like.user == request.user  # Check if the currently logged-in user has liked the post
        initial_like_data.append({
            'post_id': like.post.id,
            'liked': liked,  # You can set this based on the user's likes
            'like_count': like.post.like_count,
        })

    return JsonResponse(initial_like_data, safe=False)

def user_profile(request,user_id):

    user= user_id

    posts= Post.objects.filter(user=user).reverse()
    #for passing user to display in html header
    post_user= User.objects.get(id=user_id)
    is_following = Follow.objects.filter(follower=request.user, following=post_user).exists()
    #im not creating following instances, follower and following are not for creating, they are for counting
    follower= Follow.objects.filter(following= post_user)
    following= Follow.objects.filter(follower= post_user)

    
    
    return render(request, "network/user_profile.html",{
        "posts":posts,
        "user":post_user,
        "follower":follower,
        "following": following,
        "is_following":is_following

    })



def follow(request, user_id):
    if request.method == "PUT":
        user= User.objects.get(pk=user_id)
        followed= False

        try:
            follow= Follow.objects.get(follower= request.user, following= user)
            follow.delete()
            followed= False
            if user.follow_count >0:
                user.follow_count -=1
        except Follow.DoesNotExist:
            follow= Follow.objects.create(follower= request.user, following= user)
            followed= True
            user.follow_count += 1
            follow.save()
        return JsonResponse({'followed': followed, 'follow_count': user.follow_count})



def get_initial_follow_data(request, user_id):
    initial_follow_data= []
    user= User.objects.get(pk= user_id)
    followed = request.user.following.filter(following=user).exists()
    initial_follow_data.append({
        'user-id': user_id,
        'followed':followed,
        'follower_count': user.followers.count(),
        'following_count': user.following.count()
    })


    return JsonResponse(initial_follow_data, safe=False)


@login_required
def following(request):


    # Get the users that the current user is following
    following_users = request.user.following.all()
    following_user_ids = following_users.values_list('following', flat=True)
    
    # Retrieve posts made by users you are following
    following_posts = Post.objects.filter(user__in=following_user_ids).order_by("-date")
    return render(request, "network/following.html", {
        "following_posts": following_posts
    })






def edit_post(request, post_id):
    if request.method == "PUT":
        try:
            data = json.loads(request.body)
            new_content = data.get('new_content')

            if new_content is not None:
                post_to_edit = Post.objects.get(pk=post_id)

                # Check if the user is the author of the post
                if request.user == post_to_edit.user:
                    post_to_edit.content = new_content
                    post_to_edit.save()
                    return JsonResponse({'success': True, 'message': 'Post edited successfully.'})
                else:
                    return JsonResponse({'success': False, 'message': 'You are not the author of this post.'})

            return JsonResponse({'success': False, 'message': 'Invalid request data.'})

        except json.JSONDecodeError:
            return JsonResponse({'success': False, 'message': 'Invalid JSON data.'})
        except Post.DoesNotExist:
            return JsonResponse({'success': False, 'message': 'Post not found.'})

    return JsonResponse({'success': False, 'message': 'Invalid request method.'})