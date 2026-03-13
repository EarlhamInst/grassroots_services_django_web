from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import PhotoSerializer
from django.http import HttpResponse, Http404
import os, json
from django.conf import settings
from django.http import FileResponse
from django.http import JsonResponse
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure
import glob
import pwd
import grp
#BASE_PATH = '/home/Applications/apache/htdocs/field_trial_data/APItest/'
BASE_PATH = settings.MEDIA_ROOT
#BASE_PATH = '/home/daniel/Applications/apache/htdocs/TEST/' # local path

def set_apache_grassroots_ownership(path):
    sudo_user = os.environ.get(settings.USER)
    if sudo_user:
       return pwd.getpwnam(sudo_user)
    return pwd.getpwuid(os.getuid())

    os.chown(path, user.pw_uid, user.pw_gid)

    #print(f"Ownership changed to {user.pw_name}")


class LatestPhoto(APIView):
    def get(self, request, subfolder, plot_number):        
        ##plot_path = os.path.join(BASE_PATH, subfolder, f'photo_plot_{plot_number}_*.jpg')
        #plot_path = os.path.join(BASE_PATH, subfolder, 'photo_plot_{}_*.jpg'.format(plot_number))
        # Construct the path including the new intermediate subfolder
        plot_folder = 'plot_{}'.format(plot_number)
        plot_path = os.path.join(BASE_PATH, subfolder, plot_folder, 'photo_plot_{}_*.jpg'.format(plot_number))

        # Find all photos for the plot
        photos = glob.glob(plot_path)
        if not photos:
            raise Http404("No photos found for the plot")

        # Find the most recent photo
        latest_photo = max(photos, key=os.path.getctime)
        latest_photo_filename = os.path.basename(latest_photo)
        photo_url = request.build_absolute_uri(os.path.join(settings.MEDIA_URL, subfolder, plot_folder, latest_photo_filename))
         # Manually construct the URL
        #photo_url = 'https://grassroots.tools/' + os.path.join(settings.MEDIA_URL, subfolder, plot_folder, latest_photo_filename)

        print(photo_url)
        # Serve the photo
        #return FileResponse(open(latest_photo, 'rb'), content_type='image/jpeg')
        return JsonResponse({'status': 'success', 'filename': latest_photo_filename, 'url': photo_url})

class PhotoUploadView(APIView):
    def post(self, request, format=None):
        serializer = PhotoSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_BAD_REQUEST)
    
class PhotoRetrieveView(APIView):
    def get(self, request, subfolder, photo_name):
        # Construct the path to the photo        
        photo_path = os.path.join(BASE_PATH, subfolder, photo_name)

        print ("photo_path", photo_path)

        # Check if the photo exists
        if os.path.exists(photo_path):
            # Serve the photo
            return FileResponse(open(photo_path, 'rb'), content_type='image/jpeg')
        else:
            # Photo not found
            raise Http404("Photo not found")


class LimitsFileRetrieve(APIView):
    def get(self, request, subfolder):
        # Construct the path to the limits.json file
        #base_path = '/opt/apache/htdocs/field_trial_data/APItest/'
        subfolder_path = os.path.join(BASE_PATH, subfolder)

        # Check if the subfolder exists, if not create it
        if not os.path.exists(subfolder_path):
            os.makedirs(subfolder_path)
            set_apache_grassroots_ownership(subfolder_path)

        limits_file_path = os.path.join(BASE_PATH, subfolder, 'limits.json')

        # Check if the limits.json file exists
        if os.path.exists(limits_file_path):
            set_apache_grassroots_ownership(limits_file_path)
            # Serve the limits.json file
            return FileResponse(open(limits_file_path, 'rb'), content_type='application/json')
        else:
            # File not found
            raise Http404("limits.json not found")

class LimitsFileUpdate(APIView):
    def post(self, request, subfolder):
        subfolder_path = os.path.join(BASE_PATH, subfolder)

        # Ensure the subfolder exists, create it if not
        if not os.path.exists(subfolder_path):
            os.makedirs(subfolder_path)
            # Set ownership of the new directory
            set_apache_grassroots_ownership(subfolder_path)

        limits_file_path = os.path.join(subfolder_path, 'limits.json')

        try:
            # Assuming the data contains the trait key dynamically, like {'PH_M_cm': {'min': value, 'max': value}}
            trait_key = list(request.data.keys())[0]  # Get the first (and only) key, assuming one trait per request
            data = request.data.get(trait_key)
            min_value = data.get('min')
            max_value = data.get('max')

            # Initialize or update the limits.json file
            if not os.path.exists(limits_file_path):
                limits = {trait_key: {'min': min_value, 'max': max_value}}
            else:
                with open(limits_file_path, 'r') as file:
                    limits = json.load(file)

                # Update the specific trait's limits
                if trait_key in limits:
                   limits[trait_key]['min'] = min_value
                   limits[trait_key]['max'] = max_value
                else:
                   limits[trait_key] = {'min': min_value, 'max': max_value}

            # Write the updated or new limits to the file
            with open(limits_file_path, 'w') as file:
                json.dump(limits, file, indent=4)
                set_apache_grassroots_ownership(limits_file_path)

            return JsonResponse({'message': f'Limits for {trait_key} updated successfully'}, status=status.HTTP_200_OK)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

class AllowedStudiesView(APIView):
    def get(self, request):
        try:
            # Path to the Studies_for_app.txt file
            studies_file_path = os.path.join(settings.BASE_DIR, 'Studies_for_app.txt')

            # Check if the file exists
            if not os.path.exists(studies_file_path):
                return JsonResponse({'error': 'Studies_for_app.txt not found'}, status=404)

            # Read the file and filter out lines starting with "//"
            with open(studies_file_path, 'r') as file:
                allowed_studies = [
                    line.strip() for line in file 
                    if line.strip() and not line.strip().startswith("//")
                ]

            return JsonResponse({'allowed_studies': allowed_studies}, status=200)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)


class OnlineCheckView(APIView):
    def get(self, request):
        response = {
            'django': 'running',  # Explicit confirmation that Django is running
            'mongo': 'unknown'
        }

        # Check MongoDB connection
        try:
            client = MongoClient('mongodb://localhost:27017/', serverSelectionTimeoutMS=1000)
            client.server_info()  # Forces a call to test the connection
            response['mongo'] = 'available'
        except ConnectionFailure:
            response['mongo'] = 'unreachable'
        except Exception as e:
            response['mongo'] = f'error: {str(e)}'

        return JsonResponse(response)

