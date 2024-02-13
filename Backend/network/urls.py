
from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    path("create_post", views.create_post, name= "create_post"),
    path('like_post/<int:post_id>', views.like_post, name='like_post'),
    path('user_profile/<int:user_id>', views.user_profile, name='user_profile'),
    path('follow/<int:user_id>', views.follow,name='follow'),
    path('following_posts/', views.following_posts, name='following_posts'),
    path('edit_post/<int:post_id>', views.edit_post, name='edit_post'),
    path('get_user_status/', views.get_user_status, name='get_user_status')
    



]
