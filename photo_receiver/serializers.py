from rest_framework import serializers
from PIL import Image
from io import BytesIO
from django.core.files.base import ContentFile
import os
import pwd
import grp
from django.conf import settings
from django.templatetags.static import static

from django.conf import settings
BASE_PATH = settings.MEDIA_ROOT

def set_apache_grassroots_ownership(path):
    sudo_user = os.environ.get(settings.USER)

    if sudo_user:
        user = pwd.getpwnam(sudo_user)
    else:
        user = pwd.getpwuid(os.getuid())

    os.chown(path, user.pw_uid, user.pw_gid)

    #print(f"Ownership changed to {user.pw_name}") 


class PhotoSerializer(serializers.Serializer):
    image = serializers.ImageField(use_url=True)
    subfolder = serializers.CharField(max_length=100)
    plot_number = serializers.IntegerField()  # Add plot_number to the serializer


    def save(self):
        image = self.validated_data['image']
        subfolder = self.validated_data['subfolder']
        plot_number = self.validated_data['plot_number']  # Retrieve plot_number

        # Base path where images will be stored
        #BASE_PATH = '/home/Applications/apache/htdocs/field_trial_data/APItest/'

        # Construct the full path with subfolder
        #full_path = os.path.join(base_path, subfolder)
        full_path = os.path.join(BASE_PATH, subfolder, f'plot_{plot_number}')

        print ("saving photo to ", full_path)

        # Check if the subfolder exists, if not create it
        if not os.path.exists(full_path):
            os.makedirs(full_path)
            # Ensure ownership is applied to the new directory
            ##set_apache_grassroots_ownership(full_path)

       
        # Open the image using Pillow
        img = Image.open(image)

        # Convert to RGB if the image has an alpha channel (RGBA)
        if img.mode == 'RGBA':
            img = img.convert('RGB')


        # Calculate the thumbnail size (a quarter of the original size)
        original_size = img.size
        thumbnail_size = (original_size[0] // 4, original_size[1] // 4)
        img.thumbnail(thumbnail_size, Image.LANCZOS)

        # Save the thumbnail to a BytesIO object
        thumb_io = BytesIO()
        img.save(thumb_io, format='JPEG', quality=85)
        thumb_io.seek(0)

        thumbnail_name = 'thumb_' + image.name
        thumbnail_path = os.path.join(full_path, thumbnail_name)

        with open(thumbnail_path, 'wb+') as thumb_file:
            thumb_file.write(thumb_io.read())

        image.seek(0)
        original_name = image.name
        original_path = os.path.join(full_path, original_name)

        with open(original_path, 'wb+') as original_file:
            for chunk in image.chunks():
                original_file.write(chunk)

        # Update the serializer's `image` field with the URL or path to the saved file
        relative_image_path = os.path.relpath(original_path, BASE_PATH)
        self.saved_image_url = os.path.join(settings.MEDIA_URL, relative_image_path)

    def to_representation(self, instance):
        # Ensure saved_image_url is included in the response
        return {
            "image": getattr(self, 'saved_image_url', None),
            "subfolder": self.validated_data.get('subfolder'),
            "plot_number": self.validated_data.get('plot_number'),
        }
