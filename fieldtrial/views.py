from django.shortcuts import render
import json
import os

from django.conf import settings
import numpy as np

from django import template
from plotly.offline import plot
from plotly.graph_objs import Scatter
from urllib.parse import urljoin

from functools import cmp_to_key

register = template.Library()


# Create your views here.

from django.http import HttpResponse
from .grassroots_fieldtrial_requests import get_all_fieldtrials
from .grassroots_fieldtrial_requests import get_fieldtrial
from .grassroots_fieldtrial_requests import get_study
from .grassroots_fieldtrial_requests import get_study_as_json
from .grassroots_fieldtrial_requests import get_plot
from .grassroots_fieldtrial_requests import search_fieldtrial

from .grassroots_plots import numpy_data
from .grassroots_plots import plotly_plot
from .grassroots_plots import seaborn_plot
from .grassroots_plots import treatments
from .grassroots_plots import dict_phenotypes
from .grassroots_plots import observation_dates

from .grassroots_csv import create_CSV

# path to the local directory where the images are stored. Currently in the apache directory
local_base_path = settings.MEDIA_ROOT  
# url to access the images from the web. grassroots.tools/media or grassroots.tools/beta/media
web_base_url = settings.PHOTO_URL_SERVER.rstrip('/') + '/' + settings.MEDIA_URL.lstrip('/') 

'''
Field trial index page request, pre-load the template
'''
def index_loading(request):
    #return render(request, 'fieldtrial_loading.html', {})
    return render(request, 'fieldtrial/loading.html', {})

'''
Field trial index page request, with all field trials
'''
def index(request):
    #return render(request, 'fieldtrial.html', {'data': get_all_fieldtrials, 'type': 'AllFieldTrials'})
    return render(request, 'fieldtrial/fieldtrial.html', {'data': get_all_fieldtrials, 'type': 'AllFieldTrials'})

'''
One Field trial page request
'''
def single_fieldtrial(request, fieldtrial_id):
    #return render(request, 'fieldtrial.html', {'data': get_fieldtrial(fieldtrial_id), 'type': 'Grassroots:FieldTrial'})
    return render(request, 'fieldtrial/fieldtrial.html', {'data': get_fieldtrial(fieldtrial_id), 'type': 'Grassroots:FieldTrial'})

'''
One study page request
'''
def single_study(request, study_id):
   # base_url="https://grassroots.tools"
    base_url=settings.BASE_URL
    
    print (settings)
    study = get_study_as_json (study_id)
    

    if  "phenotypes" in study: 
        phenotypes = study ['phenotypes']  # for CSV file
    if  'plots' in study: 
        plot_array = study ['plots']       # for CSV 
    if  'treatment_factors' in study:
        treatment_factors = study ['treatment_factors'] # for CSV

    full_path=request.build_absolute_uri()
    
    ft_id         = study['parent_field_trial']['_id']['$oid']
    individual_id = study['_id']['$oid']
    
    N_t=0
    counters=[]
    flag=False
    ## number of treatment factors
    if  study['treatment_factors']:
        #print(len(study_json['treatment_factors']))
        N_t = len(study['treatment_factors'])
        value1 = study['treatment_factors']
    
        #values per treatment. create array for nested for loop 
        for i in range(N_t):
            ranges=range(len(value1[i]['values']))
            counters.append (ranges)
            flag=True
   
    ## create CSV file /filedownload/Files for link grassroots.tools/download/ID 
    if  "phenotypes" in study: 
        create_CSV(plot_array, phenotypes, treatment_factors, study_id)

    ### replace 'study' for 'plots' to create the link to the plots in given study ###
    full_path_plots=full_path.replace('study', 'plots')
    print ("full path plots 1: ", full_path_plots)

    full_path_plots=full_path_plots.replace("http://127.0.0.1:8000", base_url)
    print ("full path plots 2: ", full_path_plots)
    
    ### link for field trial name replace indiviual id for id of the field trial ###
    field_trial_link=full_path.replace('study/', '')
    field_trial_link=field_trial_link.replace(individual_id, ft_id)
    field_trial_link=field_trial_link.replace("http://127.0.0.1:8000", base_url)

    ## FIND IMAGES FOR CAROUSEL 
    ##local_base_path = "/home/daniel/Applications/apache/htdocs/TEST"
    #web_base_url="https://grassroots.tools/newbeta/media"
    
    imageUrls = []

    for plot in plot_array:
        if plot.get('rows') and plot['rows'][0].get('study_index'):
            study_index = plot['rows'][0]['study_index']  # Extract study_index from the first row
            #print(study_index)
            plot_dir = f"{local_base_path}{study_id}/plot_{study_index}"
            web_plot_dir = f"{web_base_url}{study_id}/plot_{study_index}"            
            plot_images = list_image_files(web_plot_dir, plot_dir)
            imageUrls.extend(plot_images)
    
    #imageUrls = [
    #    'http://127.0.0.1:2000/TEST/64b6449ad6500621c01c65e2/plot_1/photo_plot_1_2024_02_09.jpg',
    #    'http://127.0.0.1:2000/TEST/64b6449ad6500621c01c65e2/plot_2/photo_plot_2_2024_02_14.jpg'
    #]
    #imageUrls = [
    #    'https://grassroots.tools/beta/field_trial_data/APItest/64f1e4e77c486e019b4e3017/photo_plot_1_2024_02_09.jpg',
    #    'https://grassroots.tools/beta/field_trial_data/APItest/64f1e4e77c486e019b4e3017/photo_plot_1_2024_02_13.jpg',
    #    'https://grassroots.tools/beta/field_trial_data/APItest/64f1e4e77c486e019b4e3017/photo_plot_2_2024_02_09.jpg',
    #]
    ##imageUrls = []
	
    print ("full path plots 3: ", full_path_plots)
    print ("base_url: ", base_url)

    #return render(request, 'study.html', {'data': study, 'study_json': study_json, 'type': 'Grassroots:Study', 'path_plots':full_path_plots, 'ft_path':field_trial_link, 'N_treatments':range(N_t), 'counters':counters, 'flag':flag} )
    return render(request, 'fieldtrial/study.html', {'data': json.dumps (study), 
                                                     'study_json': study, 
                                                     'type': 'Grassroots:Study', 
                                                     'path_plots':full_path_plots, 
                                                     'ft_path':field_trial_link, 
                                                     'N_treatments':range(N_t), 
                                                     'counters':counters, 
                                                     'flag':flag, 
                                                     'imageUrls':imageUrls } )
def list_image_files(base_url, directory_path):
    """
    Generate web-accessible URLs for image files in a specified directory.
    """
    image_files = []
    supported_extensions = ['.jpg', '.jpeg', '.png']
    try:
        # List all files in the directory
        for item in os.listdir(directory_path):
            # Check if the file is an image
            if any(item.endswith(ext) for ext in supported_extensions):
                # Construct web-accessible URL
                image_url = f"{base_url}/{item}"
                image_files.append(image_url)
    except FileNotFoundError:
        print("Directory not found:", directory_path)

    return image_files

    
'''
One study's plots page request
'''
def single_plot(request, plot_id):
    plot = get_plot(plot_id)
    plot_json = json.loads(plot)
    study_name = plot_json['results'][0]['results'][0]['data']['so:name']
    study_data = plot_json ['results'][0]['results'][0]['data']

    plot_array = plot_json['results'][0]['results'][0]['data']['plots']     
    treatment_factors = plot_json['results'][0]['results'][0]['data']['treatment_factors']

    total_rows    = plot_json['results'][0]['results'][0]['data']['num_rows']
    total_columns = plot_json['results'][0]['results'][0]['data']['num_columns']


    if  'phenotypes' in study_data:
        phenotypes = plot_json['results'][0]['results'][0]['data']['phenotypes']  #
        dictTraits = dict_phenotypes(phenotypes, plot_array)  # dictionary to fill dropdown menu
        default_name = list(dictTraits.keys())[0]             # select first phenotype as default
    else:
        dictTraits = {'No Data':'No data'}  #
        phenotypes = {'No Data': 'No Data'}
        default_name = list(dictTraits.keys())[0]       

   
    print("Default phenotype: ", default_name )

    if 'singlePhenotype' in request.GET:
        selected_phenotype = request.GET['singlePhenotype']
    else:
        selected_phenotype = default_name

    matrices   = numpy_data(plot_array, phenotypes, selected_phenotype, total_rows, total_columns)

    row     = matrices[0]
    column  = matrices[1]
    row_raw = matrices[2]
    row_acc = matrices[3]
    traitName = matrices[4]
    units     = matrices[5]
    plotID    = matrices[6]

    plotIDs      =  plotID.reshape(row,column)
    accession    = row_acc.reshape(row,column)
    #plotlyMatrix = row_raw.reshape(row,column) #reshape in plotly_div()
    static    = row_raw.reshape(row,column)
    
    treatment=[]
    if ( len(treatment_factors)>0):
          treatment = treatments(plot_array, row, column)

     # Generate the observation dates matrix
    dates = observation_dates(plot_array, row, column, selected_phenotype)
    #print ("dates__________", dates)
    # Check if all dates are "N/A"
    if np.all(dates == "N/A"):
        dates = []  # Empty list if all dates are "N/A"

    create_CSV(plot_array, phenotypes, treatment_factors, plot_id)
    plot_div = plotly_plot(row_raw, accession, traitName, units, plotIDs, treatment, dates)
    
    data = plot
    imageUrls = []
    ## FIND IMAGES FOR CAROUSEL 
    #####local_base_path = "/home/daniel/Applications/apache/htdocs/TEST"
    ##web_base_url="https://grassroots.tools/newbeta/media"
    for plot in plot_array:
        if plot.get('rows') and plot['rows'][0].get('study_index'):
            study_index = plot['rows'][0]['study_index']  # Extract study_index from the first row
            #print(study_index)
            plot_dir = f"{local_base_path}{plot_id}/plot_{study_index}"
            web_plot_dir = f"{web_base_url}{plot_id}/plot_{study_index}"            
            plot_images = list_image_files(web_plot_dir, plot_dir)
            imageUrls.extend(plot_images)
    #print("Image URLs: ", imageUrls)

    #return render(request, 'plots.html', {'data': data, 'plot_id': plot_id, 'study_name': study_name, 
    #    'plot_div': plot_div, 'dictTraits':dictTraits, 'imageUrls':imageUrls})
    return render(request, 'fieldtrial/plots.html', {'data': data, 'plot_id': plot_id, 'study_name': study_name, 
        'plot_div': plot_div, 'dictTraits':dictTraits, 'imageUrls':imageUrls})




'''
One study's plots page request
'''
def plots_view (request, study_id):
  study = get_study_as_json (study_id)


  # study_text = json.dumps (study, indent = 2)
  # print (study)

  study_name = ""
  if "so:name" in study:
    study_name = study ["so:name"]

  dictTraits = ""
  imageUrls = ""
    
  num_rows = study ["num_rows"]  
  num_columns = study ["num_columns"]	
  plot_block_columns = study ["plot_block_columns"]
  plot_block_rows = study ["plot_block_rows"]

  if "plots" in study:
    plots = study ["plots"]

    # Get an array of plot rows where each 
    # item on it is an array containing all of the 
    # plots for that row index in column order
    plot_rows = []
    current_row = list ()
    current_row_index = 1;
    plot_rows.append (current_row)


    for plot in plots:
      row_index = plot ["row_index"]

      if row_index != current_row_index:
        current_row_index = row_index
        current_row = list ()
        plot_rows.append (current_row)

      current_row.append (plot)

  # Django doesn't like keys with . or : so 
  # we'll convert the treatment factors here
  treatments_django = None
  
  if study ["treatment_factors"]:
    treatments_django = list ()
	  
    for tf in study ["treatment_factors"]:
      print ("**** begin tf")
      print (tf)
      print ("**** end tf")
      
      treatment_django = {}
      
      if tf ["treatment"]:
        treatment = tf ["treatment"]
		
        if treatment ["so:name"]:
          treatment_django ["name"] = treatment ["so:name"]

        if treatment ["so:description"]:
          treatment_django ["description"] = treatment ["so:description"]	  

        if treatment ["so:sameAs"]:
          treatment_django ["url"] = treatment ["so:sameAs"]	

        treatment_django ["values"] = tf ["values"]
    
        treatments_django.append (treatment_django)

  plot_rows.reverse ()
    
  return render(request, 'fieldtrial/plots_new.html', {'study_id': study_id, 'study': study, 'study_name': study_name, 'plot_block_columns': plot_block_columns, 'plot_block_rows': plot_block_rows, 'plot_rows': plot_rows, 'dictTraits':dictTraits, 'imageUrls':imageUrls, 'treatments': treatments_django})


def ComparePlots (plot0, plot1):
  res = 0;
  val0 = plot0 ["row"]

  if val0 is not None:
    val1 = plot1 ["row"]

    if val1 is not None:
      res = val0 - val1

  if res == 0:
    val0 = plot0 ["column"]

    if val0 is not None:
      val1 = plot1 ["column"]

      if val1 is not None:
        res = val0 - val1

  return res;

'''
Search field trial page request
'''
def search_fieldtrial(request):
    data = request.POST.get('search_str', False)
    response_json = search_fieldtrial(data)
    return HttpResponse(response_json)


