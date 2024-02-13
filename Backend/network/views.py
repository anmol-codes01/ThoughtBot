from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.shortcuts import render
from django.shortcuts import redirect
from django.views.decorators.http import require_http_methods
from django.urls import reverse
from .forms import PostForm
from django.contrib.auth.decorators import login_required
from django.core.paginator import Paginator
import json
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from rest_framework.authtoken.models import Token
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.decorators import authentication_classes, permission_classes
from rest_framework.authentication import TokenAuthentication
from .models import User,Post,Likes,Follow
from django.shortcuts import get_object_or_404
from rest_framework.response import Response
from rest_framework import status




def index(request):
    all_posts = Post.objects.all().order_by("-id")

    paginator = Paginator(all_posts, 10)
    page = request.GET.get('page')

    try:
        posts = paginator.page(page)
    except PageNotAnInteger:
        posts = paginator.page(1)
    except EmptyPage:
        posts = paginator.page(paginator.num_pages)

    post_data = []
    for post in posts:
        post_data.append({
            'id': post.id,
            'content': post.content,
            'author': post.user.username,
            'user_id':post.user.id,
            # 'date': post.date,
            'like_count': post.like_count,
            'liked': post.liked,
            'edited':post.edited
            # Include other fields as needed
        })

    total_posts = all_posts.count()
    total_pages = paginator.num_pages

    response_data = {
        'posts': post_data,
        'totalPosts': total_posts,
        'totalPages': total_pages,
    }

    return JsonResponse(response_data)



@api_view(['POST', 'GET'])
@permission_classes([AllowAny])
def login_view(request):
    if request.method == "POST":
        username = request.POST.get("username")
        password = request.POST.get("password")

        user = authenticate(request, username=username, password=password)

        if user is not None:
            login(request, user)

            # Create or get a token for the user
            token, _ = Token.objects.get_or_create(user=user)

            # Add the token to the redirect URL as a query parameter
            redirect_url = f'http://localhost:5173/?token={token.key}'

            # Redirect to the React homepage with the token as a query parameter
            return HttpResponseRedirect(redirect_url)
        else:
            return JsonResponse({'error': 'Invalid username and/or password.'}, status=400)
    else:

        # Handle GET request, render the Django login template
        return render(request, 'network/login.html')

@api_view(['GET'])
@authentication_classes([TokenAuthentication])
def get_user_status(request):
    if request.method== "GET":

      
        user_status = {
            'is_authenticated': request.user.is_authenticated,
            'username': request.user.username if request.user.is_authenticated else None,
            'user_id':request.user.id if request.user.is_authenticated else None,
            # Add any other relevant user information you want to send to the frontend
        }
        return JsonResponse(user_status)


@api_view(['POST', 'GET'])
def logout_view(request):
    logout(request)
    return Response({'detail': 'Logout successful'}, status=status.HTTP_200_OK)

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
    

@api_view(['POST'])
def create_post(request):
    # Extract the data from the request body
    data = json.loads(request.body)
    content = data.get('content')

    # Perform your custom validation
    if not content:
        return JsonResponse({'success': False, 'errors': {'content': ['Content is required']}}, status=400)

    # Save the post to the database (assuming Post is your model)
    post = Post.objects.create(content=content, user=request.user)
    data = {
            'success': True,
            'message': 'Post created successfully',
            'post': {

                'id': post.id,
                'content': post.content,
                'author': post.user.username,
                'user_id':post.user.id,
                # 'date': post.date,
                'like_count': post.like_count,
                'liked': post.liked,
                'edited':post.edited


                # Add other fields as needed
            }
        }

    # Return success response
    return JsonResponse(data)


@api_view(['PUT'])
def like_post(request, post_id):
    if request.method == 'PUT':
        post = Post.objects.get(pk=post_id)
        user = request.user

        try:
            # Check if the user already liked the post
            like = Likes.objects.get(user=user, post=post)
            like.delete()  # User unlikes the post
            post.liked = False
            if post.like_count > 0:
                post.like_count -= 1
        except Likes.DoesNotExist:
            # User is liking the post
            Likes.objects.create(user=user, post=post)
            post.liked = True
            post.like_count += 1
        
        post.save()



        return JsonResponse({'liked': post.liked, 'like_count': post.like_count})




@api_view(['GET'])
def user_profile(request, user_id):
    # Get the user object corresponding to the user_id
    post_user = get_object_or_404(User, pk=user_id)

    # Fetch posts for the user
    posts = Post.objects.filter(user=post_user).order_by('-date')

    # Check if the logged-in user is following the user
    if request.user.is_authenticated:
        is_following = Follow.objects.filter(follower=request.user, following=post_user).exists()
    else:
        is_following = False

    # Fetch follower and following counts
    follower_count = Follow.objects.filter(following=post_user).count()
    following_count = Follow.objects.filter(follower=post_user).count()

    # Construct JSON response data
    response_data = {
        "posts": [{"id": post.id, "content": post.content, "date_created": post.date , "user_id":post_user.id,"author": post_user.username, "like_count": post.like_count, "liked": post.liked } for post in posts],
        "user": {"id": post_user.id, "username": post_user.username}, # You can include more user details here
        "follower_count": follower_count,
        "following_count": following_count,
        "is_following": is_following
    }

    # Return JSON response
    return JsonResponse(response_data)


@api_view(['PUT'])
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




# @login_required
# def following(request):


#     # Get the users that the current user is following
#     following_users = request.user.following.all()
#     following_user_ids = following_users.values_list('following', flat=True)
    
#     # Retrieve posts made by users you are following
#     following_posts = Post.objects.filter(user__in=following_user_ids).order_by("-date")
#     return render(request, "network/following.html", {
#         "following_posts": following_posts
#     })
    
@api_view(['GET'])
def following_posts(request):
    # Retrieve the posts of the users that the current user follows
    # following_users = Follow.objects.filter(follower=request.user).values_list('following', flat=True)
    # following_posts = Post.objects.filter(user__in=following_users).order_by("-id")
    following_users = request.user.following.all()
    following_user_ids = following_users.values_list('following', flat=True)
    
    # Retrieve posts made by users you are following
    following_posts = Post.objects.filter(user__in=following_user_ids).order_by("-date")


    paginator = Paginator(following_posts, 10)
    page = request.GET.get('page')

    try:
        posts = paginator.page(page)
    except PageNotAnInteger:
        posts = paginator.page(1)
    except EmptyPage:
        posts = paginator.page(paginator.num_pages)

    post_data = []
    for post in posts:
        post_data.append({
            'id': post.id,
            'content': post.content,
            'author': post.user.username,
            'user_id': post.user.id,
            'like_count': post.like_count,
            'liked': post.liked,
            'edited': post.edited
            # Include other fields as needed
        })

    total_posts = following_posts.count()
    total_pages = paginator.num_pages

    response_data = {
        'posts': post_data,
        'totalPosts': total_posts,
        'totalPages': total_pages,
    }

    return JsonResponse(response_data)


@require_http_methods(["PUT"])
@api_view(['PUT'])
def edit_post(request, post_id):
    try:
        data = json.loads(request.body)
        new_content = data.get('content')

        if new_content:
            try:
                post_to_edit = Post.objects.get(pk=post_id)
            except Post.DoesNotExist:
                return JsonResponse({'success': False, 'message': 'Post not found.'}, status=404)

            # Check if the user is the author of the post
            if request.user == post_to_edit.user:
                post_to_edit.content = new_content
                post_to_edit.edited= True
                post_to_edit.save()

                return JsonResponse({'success': True, 'edited': post_to_edit.edited,'message': 'Post edited successfully.'})
            else:
                return JsonResponse({'success': False, 'message': 'You are not the author of this post.'}, status=403)
        else:
            return JsonResponse({'success': False, 'message': 'Invalid request data.'}, status=400)

    except json.JSONDecodeError:
        return JsonResponse({'success': False, 'message': 'Invalid JSON data.'}, status=400)