from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    follow_count= models.PositiveIntegerField(default=0) #Adding a field of follow count


class Post(models.Model):
    content= models.CharField(max_length= 140)
    user= models.ForeignKey(User, on_delete= models.CASCADE, related_name= "author")
    date= models.DateTimeField(auto_now_add=True)
    like_count= models.PositiveIntegerField(default=0) #Adding a field of like count
    liked = models.BooleanField(default=False)  # New field

    edited= models.BooleanField(default=False)


    def __str__(self):
        return f"Post {self.id} made by {self.user} on {self.date.strftime('%d %b %Y %H:%M:%S')}"
    
#implementing a likes model and creating relationships with other models
class Likes(models.Model):
    user= models.ForeignKey(User, on_delete= models.CASCADE)
    post= models.ForeignKey(Post, on_delete= models.CASCADE)
    def __str__(self):
        return f"Post {self.post.content} liked by {self.user}"



class Follow(models.Model):
    follower = models.ForeignKey(User, related_name='following', on_delete=models.CASCADE)
    following = models.ForeignKey(User, related_name='followers', on_delete=models.CASCADE)
    def __str__(self):
        return f" {self.follower} is following {self.following}"