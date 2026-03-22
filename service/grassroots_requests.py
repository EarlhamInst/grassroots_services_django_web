import requests
import json
from django.conf import settings

server_url = settings.SERVER_URL
private_server_url = settings.PRIVATE_SERVER_URL
queen_server_url = settings.QUEEN_SERVER_URL

'''
Get all services
returns JSON from backend and send to the model
'''
def get_all_services (request, path):
    req_json = {"operations": {"operation": "get_all_services"}}
    result = call_grassroots_server (request, req_json, path)

    return result

'''
Get one service with an alternative name
returns JSON from backend and send to the model
'''
def get_service(service_alt_name, str):
    req_json = {"services": [{"so:alternateName": service_alt_name}], "operations": {"operation": "get_named_service"}}
    result = call_grassroots_server (request, req_json, path)

    return result



def call_grassroots_server (request, req_json, path):
    result = None
    url = None
    res = None

    if path == 'public':
        url = server_url
    elif path == 'private':
        url = private_server_url
    elif path == 'queen':
        url = queen_server_url

    if url is not None:
        print (">>>> calling url " + url)
        req_data = json.dumps (req_json)

        try: 
          res = requests.post (url, data = req_data, headers = request.headers)
          response_text = res.text;
          print (">>>> Received: " + response_text)
          result = res.json ()
        except Exception as e:
            print (">>>> Error calling  url: " + url + " data: " + req_data + " headers: ")
            print (request.headers)
            print (e)       
      			
    else:
        print (">>>> no url for " + path)

    return result



'''
Send request to apache backend
returns JSON from backend
'''
def interact_backend(data, str):
    if str == 'public':
        res = requests.post(server_url, data=data)
    elif str == 'private':
        res = requests.post(private_server_url, data=data)
    elif str == 'queen':
        res = requests.post(queen_server_url, data=data)
    return json.dumps(res.json())


'''
Provides ols for phenotype search with a string, for COPO
returns formatted JSON from backend to conform the OLS standard
'''
def search_treatment_return_ols(string):
    submit_json = {
        "services": [
            {
                "start_service": True,
                "so:name": "Search Field Trials",
                "parameter_set": {
                    "level": "simple",
                    "parameters": [
                        {
                            "param": "FT Keyword Search",
                            # "current_value": f"{string}*"
                            "current_value": "{}*".format(string)
                        },
                        {
                            "param": "FT Facet",
                            "current_value": "Measured Variable"
                        },
                        {
                            "param": "FT Results Page Number",
                            "current_value": 0
                        },
                        {
                            "param": "FT Results Page Size",
                            "current_value": 500
                        }
                    ]
                }
            }
        ]
    }
    res = requests.post(server_url, data=json.dumps(submit_json))
    res_json = res.json()

    num_found = res_json['results'][0]['metadata']['total_hits']

    if num_found > 0:
        results = res_json['results'][0]['results']
        docs_results = []

        response_json = {
            "responseHeader": {
                "status": 0,
                "response": {
                    # "numFound": 2,
                    "start": 0
                    # ,
                    # "docs": [{
                    #     "id": "cco:http://identifiers.org/uniprot/Q9M339",
                    #     "iri": "http://identifiers.org/uniprot/Q9M339",
                    #     "short_form": "Q9M339",
                    #     "label": "RS32_ARATH",
                    #     "ontology_name": "cco",
                    #     "ontology_prefix": "CCO",
                    #     "type": "class"
                    # },
                    #     {
                    #         "id": "ncbitaxon:class:http://purl.obolibrary.org/obo/NCBITaxon_467564",
                    #         "iri": "http://purl.obolibrary.org/obo/NCBITaxon_467564",
                    #         "short_form": "NCBITaxon_467564",
                    #         "obo_id": "NCBITaxon:467564",
                    #         "label": "bacterium RS32G",
                    #         "ontology_name": "ncbitaxon",
                    #         "ontology_prefix": "NCBITAXON",
                    #         "type": "class"
                    #     }
                    # ],
                    # "highlighting": {
                    #     "cco:http://identifiers.org/uniprot/Q9M339": {
                    #         "label_autosuggest": [
                    #             "<b>RS32_ARATH</b>"
                    #         ]
                    #     },
                    #     "ncbitaxon:class:http://purl.obolibrary.org/obo/NCBITaxon_467564": {
                    #         "label_autosuggest": [
                    #             "bacterium <b>RS32G</b>"
                    #         ]
                    #     }
                    # }
                }
            }
        }
        response_json['responseHeader']['response']['numFound'] = num_found

        highlighting = {}
        for each_result in results:
            each_result_formated = {}

            id = each_result['data']['variable']['so:name']
            each_result_formated['id'] = id
            each_result_formated['iri'] = "http://www.cropontology.org/terms/" + each_result['data']['variable']['so:sameAs']
            each_result_formated['short_form'] = id
            each_result_formated['obo_id'] = ""
            each_result_formated['label'] = each_result['data']['trait']['so:name']
            each_result_formated['ontology_name'] = each_result['data']['variable']['so:sameAs']
            each_result_formated['ontology_prefix'] = "co"
            each_result_formated['type'] = each_result['data']['@type']

            docs_results.append(each_result_formated)

            highlighting[id] = {
                "label_autosuggest": [
                    # f"{string}"
                    "{}".format(string)
                ]
            }

        response_json['responseHeader']['response']['docs'] = docs_results
        response_json['responseHeader']['response']['highlighting'] = highlighting
        return json.dumps(response_json)
    else:
        return "[]"
