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


def get_all_fieldtrials_mongo():
    list_all_ft_request = {
        "services": [
            {
                "so:name": "Search Field Trials",
                "start_service": True,
                "parameter_set": {
                    "level": "advanced",
                    "parameters": [
                      {
                        "param": "ST Search Studies",
                        "current_value": True,
                        "group": "Studies"
                      },
                      {
                        "param": "Get all studies",
                        "current_value": True,
                        "group": "Studies"
                      },
                      {
                        "param": "The level of data to get for matching Studies",
                        "current_value": "Metadata",
                        "group": "Studies"
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
def get_study(id):
    study_request = {
            "services": [{
                "so:name": "Search Field Trials",
                "start_service": True,
                "parameter_set": {
                    "level": "advanced",
                    "parameters": [{
                        "param": "ST Id",
                        "current_value": id
                    }, {
                       ## "param": "Get all Plots for Study",
                       ## "current_value": True
                       "param": "The level of data to get for matching Studies", "current_value": "Full"
                    }, {
                        "param": "ST Search Studies",
                        "current_value": True
                    }]
                }
            }]
        }
    res = requests.post(server_url, data=json.dumps(study_request))
    return json.dumps(res.json())


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

