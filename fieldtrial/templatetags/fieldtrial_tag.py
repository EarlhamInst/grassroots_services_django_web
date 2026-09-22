from django import template
from functools import reduce

register = template.Library()

@register.simple_tag
def lookup_keys(dictionary, keys, default=None): 
  return reduce(lambda d, key: d.get(key, default) if isinstance(d, dict) else default, keys.split("."), dictionary)
    

@register.simple_tag
def GetPlotValue (plot, plot_key, study, study_key):
  res = plot [plot_key]
	
  if res is None:
    res = study [study_key]
    
  return res