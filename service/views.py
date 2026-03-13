from django.shortcuts import render
import json
import logging

# Create your views here.

from django.http import HttpResponse
from .grassroots_requests import get_all_services
from .grassroots_requests import get_service
from .grassroots_requests import search_treatment_return_ols
from .grassroots_requests import interact_backend

'''
index page
'''

ontologies = {
  "so": "http://schema.org/",
  "eo": "http://edamontology.org/",
  "efo": "http://www.ebi.ac.uk/efo/",
  "swo": "http://www.ebi.ac.uk/swo/",
  "co": "http://www.cropontology.org/terms/",

  "envo": "http://purl.obolibrary.org/obo/ENVO_",
  "agro": "http://purl.obolibrary.org/obo/AGRO_",
  "ncit": "http://purl.obolibrary.org/obo/NCIT_",
  "stato": "http://purl.obolibrary.org/obo/STATO_"
};


def index (request):
  return real_index (request, "public")


def private_index (request):
  return real_index (request, "private")

def queen_index (request):
  return real_index (request, "queen")


def real_index (request, path):

  services = []
  service_list_json = get_all_services (request, path)
	

  if service_list_json != None:
    services_json = service_list_json ["services"]  
    

    for service_json in services_json:
      service = {};

      if "so:name" in service_json:
        service ["name"] = service_json ["so:name"];
  
      if "so:description" in service_json:
        service ["description"] = service_json ["so:description"];

      if "so:alternateName" in service_json:
        service ["alt_name"] = service_json ["so:alternateName"];

      try:
        if (service_json ["operation"] is not None):
           if (service_json ["operation"]["so:image"] is not None):
            service ["image"] = service_json ["operation"]["so:image"];
      except KeyError:
        print (service_json)

      
      category = service_json ["category"]

      if (category is not None):    
        if "application_category" in category:
          AddCategoryLinks (category, "application_category", service, "category");
  
        if "application_subcategory" in category:
          AddCategoryLinks (category, "application_subcategory", service, "subcategory");

#          if "so:name" in category ["application_subcategory"]:
#            name = category ["application_subcategory"] ["so:name"]
#            service ["subcategory"] = name;


        AddOntologyLinks (category, "input", service, "input");

        AddOntologyLinks (category, "output", service, "output");


      AddProviderLinks (service_json, service)

      services.append (service)        


	user = service_list_json ["user"]
	if user != None:
		# Django doesn't like keys containing colons so add the non-colon versions of the values
		if user ["so:email"] != None:
			user ["email"] = user ["so:email"]

  return render(request, 'index.html', {'private': '', 'services': services, 'user': user})



def AddProviderLinks (src, dest): 
  providers = []

  if "provider" in src  :
    provider = GetProvider (src ["provider"]);
    providers.append (provider)

  elif "providers" in src:
            
    for provider_json in providers:
      provider = GetProvider (provider_json);
      providers.append (provider)

  dest ["provider"] = providers
  
  return providers



def GetProvider (provider_json):
  provider = {}

  if "so:name" in provider_json:
    provider ["name"] = provider_json ["so:name"]
  
  if "so:description" in provider_json:
    provider ["description"] = provider_json ["so:description"]

  if "so:url" in provider_json:
    provider ["url"] = provider_json ["so:url"]

  if "so:logo" in provider_json:
    provider ["logo"] = provider_json ["so:logo"]
        
  return provider




def AddCategoryLinks (src, src_name, dest, dest_name):


  category = {}

  if src_name in src:
    i = src [src_name];

    if "so:name" in i:
      category ["name"] = i ["so:name"]
    
    if "so:description" in i:
      category ["description"] = i ["so:description"]

    if "so:sameAs" in i:
      parts = i ["so:sameAs"].split (":")
      
      if len (parts) == 2:
        prefix = ontologies [parts [0]]

        if prefix is not None:
          category ["url"] = prefix + parts [1]
    
    dest [dest_name] = category
            
  return category



def AddOntologyLinks (src, src_name, dest, dest_name):
  values = []

  if src_name in src:
    for i in src [src_name]:
      obj = {}

      if "so:name" in i:
        obj ["name"] = i ["so:name"]
      
      if "so:description" in i:
        obj ["description"] = i ["so:description"]

      if "so:sameAs" in i:
        parts = i ["so:sameAs"].split (":")
        
        if len (parts) == 2:
          prefix = ontologies [parts [0]]

          if prefix is not None:
            obj ["url"] = prefix + parts [1]
        
      values.append (obj)
  
  if (len (values) > 0):
    dest [dest_name] = values

  return values

'''
Private services index page
'''
def old_private_index(request):
  services = []
  service_list_json = get_all_services('private')

  services_list = None

  if service_list_json != None:
    services_json = service_list_json ["services"]  
  
    for i in services_json:
      s = services_json [i] 
      t = s ["@type"]

      if (t != None):
        services.append (t)

      
  return render(request, 'index.html', {'private': 'private/', 'services': services})
'''
Queen services index page
'''
def old_queen_index(request):
    return render(request, 'index.html', {'private': 'queen/'})

'''
Get all public services as a json array
'''
def index_ajax(request):
    service_list_json = get_all_services('public')
    return HttpResponse(service_list_json)

'''
Get all private services as a json array
'''
def private_index_ajax(request):
    service_list_json = get_all_services('private')
    return HttpResponse(service_list_json)


'''
Get all private services as a html table
'''
def private_index_ajax_table(request):
    service_list_json = get_all_services('private')
    return HttpResponse(service_list_json)

'''
Get all queen services as a json array
'''
def queen_index_ajax(request):
    service_list_json = get_all_services('queen')
    return HttpResponse(service_list_json)

'''
Get one named service
'''
def single_service(request, service_alt_name):
    return render(request, 'service.html', {'service_alt_name': service_alt_name, 'private': ''})

'''
Get one named private service
'''
def private_single_service(request, service_alt_name):
    return render(request, 'service.html', {'service_alt_name': service_alt_name, 'private': 'private/'})

'''
Get one named queen service
'''
def queen_single_service(request, service_alt_name):
    return render(request, 'service.html', {'service_alt_name': service_alt_name, 'private': 'queen/'})

'''
Get one named service with payload
'''
def single_service_with_payload(request, payload):
    return render(request, 'service_payload.html', {'payload': payload})

'''
Get search grassroots service with a query
'''
def single_service_search_q(request, search_q):
    return render(request, 'service_search_q.html', {'q': search_q})

'''
Get one public grassroots service with a service name
'''
def single_service_ajax(request):
    service_name = request.POST['service_name']
    service_json = get_service (request, service_name, 'public')
    return HttpResponse(service_json)

'''
Get one private grassroots service with a service name
'''
def private_single_service_ajax(request):
    service_name = request.POST['service_name']
    service_json = get_service (request, service_name, 'private')
    return HttpResponse(service_json)

'''
Get one queen grassroots service with a service name
'''
def queen_single_service_ajax(request):
    service_name = request.POST['service_name']
    service_json = get_service (request, service_name, 'queen')
    return HttpResponse(service_json)


'''
Post request from front-end to the public backend
'''
def interact_with_apache(request):
    data = request.body
    response_json = interact_backend(data, 'public')
    return HttpResponse(response_json)

'''
Post request from front-end to the private backend
'''
def private_interact_with_apache(request):
    data = request.body
    response_json = interact_backend(data, 'private')
    return HttpResponse(response_json)

'''
Post request from front-end to the queen backend
'''
def queen_interact_with_apache(request):
    data = request.body
    response_json = interact_backend(data, 'queen')
    return HttpResponse(response_json)


'''
GET request for ontology look up service for COPO
'''
def crop_ontology_search(request):
    search_string = request.GET['q']
    response_json = search_treatment_return_ols(search_string)
    return HttpResponse(response_json, content_type='application/json')
