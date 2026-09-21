import requests
import json
from django.conf import settings

server_url = settings.SERVER_URL

'''
Get all field trial request from the backend
returns JSON from backend and send to the model
'''
def get_all_fieldtrials():
    list_all_ft_request = {
        "services": [
            {
                "so:name": "Search Field Trials",
                "start_service": True,
                "parameter_set": {
                    "level": "simple",
                    "parameters": [
                        {
                            "param": "FT Keyword Search",
                            "current_value": ""
                        },
                        {
                            "param": "FT Study Facet",
                            "current_value": True
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
    res = requests.post(server_url, data=json.dumps(list_all_ft_request))
    return json.dumps(res.json())

'''
Search field trials with a given string
returns JSON from backend and send to the model
'''
def search_fieldtrial(str):
    list_all_ft_request = {
        "services": [
            {
                "so:name": "Search Field Trials",
                "start_service": True,
                "parameter_set": {
                    "level": "simple",
                    "parameters": [
                        {
                            "param": "FT Keyword Search",
                            "current_value": str
                        },
                        {
                            "param": "FT Study Facet",
                            "current_value": True
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
    res = requests.post(server_url, data=json.dumps(list_all_ft_request))
    return json.dumps(res.json())

'''
Get a field trial with a id
returns JSON from backend and send to the model
'''
def get_fieldtrial(id):
    list_all_ft_request = {
        "services": [{
            "start_service": True,
            "so:name": "Search Field Trials",
            "parameter_set": {
                "level": "advanced",
                "parameters": [
                    {
                        "param": "FT Id",
                        "current_value": id
                    },
                    {
                        "param": "FT Trial Facet",
                        "current_value": True
                    },
                    {
                        "param": "FT Results Page Number",
                        "current_value": 0
                    },
                    {
                        "param": "FT Results Page Size",
                        "current_value": 100
                    }
                ]
            }
        }]
    }
    res = requests.post(server_url, data=json.dumps(list_all_ft_request))
    return json.dumps(res.json())
#    return res.json()

'''
Get a study with a id
returns JSON from backend and send to the model
'''
def get_study (study_id):
	study = None
	study_json = get_study_as_json (study_id)
	
	if study_json:
		study = json.dumps (study_json.json ())
		
	return study


def get_study_as_json (study_id):
	study_json = None
	
	study_request = {
		"services": [{
			"so:name": "Search Field Trials",
			"start_service": True,
			"parameter_set": {
				"level": "advanced",
				"parameters": [{
					"param": "ST Id",
					"current_value": study_id
				}, {
					"param": "The level of data to get for matching Studies", 
					"current_value": "Full"
				}, {
					"param": "ST Search Studies",
					"current_value": True
				}]
			}
		}]
	}

	res = requests.post (server_url, data=json.dumps (study_request))
	
	if res:
		res_json = res.json ()
		
		results = res_json ["results"]
		
		if results:		
			first_result = results [0]
			
			if first_result:
				results = first_result ["results"]
				
				if results:		
					first_result = results [0]

					if "data" in first_result:
						study_json = first_result ["data"]


	return study_json

'''
Get plots from a study with a study id
returns JSON from backend and send to the model
'''
def get_plot(id):
    plot_request = {
            "services": [{
                "so:name": "Search Field Trials",
                "start_service": True,
                "parameter_set": {
                    "level": "advanced",
                    "parameters": [{
                        "param": "ST Id",
                        "current_value": id
                    }, {
                        #"param": "Get all Plots for Study",
                        #"current_value": True
                        "param": "The level of data to get for matching Studies", "current_value": "Full"

                    }, {
                        "param": "ST Search Studies",
                        "current_value": True
                    }]
                }
            }]
        }
    res = requests.post(server_url, data=json.dumps(plot_request))
    return json.dumps(res.json())

