from django import template
from django.utils.safestring import mark_safe

from django.utils.html import format_html

from functools import reduce

register = template.Library()

@register.filter
def index(indexable, i):
    return indexable[i]


@register.simple_tag
def format_programme(dictionary, keys, default=None):
    name =  reduce(lambda d, key: d.get(key, default) if isinstance(d, dict) else default, keys.split("."), dictionary)
    
    image_key    ="parent_program.so:image"
    pi_name_key  ="parent_program.principal_investigator.so:name"
    pi_email_key ="parent_program.principal_investigator.so:email"

    image    =  reduce(lambda d, key: d.get(key, default) if isinstance(d, dict) else default, image_key.split("."), dictionary)
    pi_name  =  reduce(lambda d, key: d.get(key, default) if isinstance(d, dict) else default, pi_name_key.split("."), dictionary)
    pi_email =  reduce(lambda d, key: d.get(key, default) if isinstance(d, dict) else default, pi_email_key.split("."), dictionary)

    programme = name
     
    if image != "" and image != None :
        programme = mark_safe( '<img src="' + image + '"> <br>'+ programme + '<br>')

    if pi_name != "" and pi_name != None :
        if pi_email != "" and pi_email != None :
            programme = programme + '<a href="mailto:'+pi_email + '">' + pi_name +'</a>' 

    return (mark_safe(programme)) 


@register.simple_tag
def format_ft_name(dictionary, keys, default=None):
    name      =  reduce(lambda d, key: d.get(key, default) if isinstance(d, dict) else default, keys.split("."), dictionary)
    ft_id_key ="parent_field_trial._id.$oid"
    id_key    ="_id.$oid"
    
    ft_id         =  reduce(lambda d, key: d.get(key, default) if isinstance(d, dict) else default, ft_id_key.split("."), dictionary)
    individual_id =  reduce(lambda d, key: d.get(key, default) if isinstance(d, dict) else default, id_key.split("."), dictionary)

    ft_name = name
    #print(ft_id)
    #print(individual_id)
     
    return (ft_name) 


@register.simple_tag
def format_treatment(dictionary, main_key, keys, counter, default=None):
    lists  =  reduce(lambda d, key: d.get(key, default) if isinstance(d, dict) else default, main_key.split("."), dictionary)
    nested_dic = lists[counter]

    name  =  reduce(lambda d, key: d.get(key, default) if isinstance(d, dict) else default, keys.split("."), nested_dic)
     
    return (name) 

@register.simple_tag
def format_ontology_link(dictionary, main_key, keys, counter, default=None):
    lists  =  reduce(lambda d, key: d.get(key, default) if isinstance(d, dict) else default, main_key.split("."), dictionary)
    nested_dic = lists[counter]

    ontology  =  reduce(lambda d, key: d.get(key, default) if isinstance(d, dict) else default, keys.split("."), nested_dic)
    
    link = '<a target="_blank" href="https://browser.planteome.org/amigo/term/' + ontology + '">' + ontology +'</a>'
     
    return (mark_safe(link)) 


@register.simple_tag
def format_treatment_lists(dictionary, main_key, keys, inner_key, counter1, counter2, default=None):
    lists  =  reduce(lambda d, key: d.get(key, default) if isinstance(d, dict) else default, main_key.split("."), dictionary)
    nested_dic = lists[counter1]

    name  =  reduce(lambda d, key: d.get(key, default) if isinstance(d, dict) else default, keys.split("."), nested_dic)
    
    #inner_key="Label"
    inner_dic=name[counter2]
    nested_values  =  reduce(lambda d, key: d.get(key, default) if isinstance(d, dict) else default, inner_key.split("."), inner_dic)
    #print(nested_values)
    
    return (nested_values) 




@register.simple_tag
def format_curator(dictionary, keys, default=None):
    name =  reduce(lambda d, key: d.get(key, default) if isinstance(d, dict) else default, keys.split("."), dictionary)
    keys="curator.so:email"
    email =  reduce(lambda d, key: d.get(key, default) if isinstance(d, dict) else default, keys.split("."), dictionary)

    curator_name = name
    
		if curator_name == None:
			curator_name = ""    
    
    if email != "" and email != None :
        curator_name='<a href="mailto:'+ email + '">' + curator_name +'</a>'
        curator_name = mark_safe(curator_name)
      
    return (curator_name) 



@register.simple_tag
def format_contact(dictionary, keys, default=None):
    name =  reduce(lambda d, key: d.get(key, default) if isinstance(d, dict) else default, keys.split("."), dictionary)
    keys="contact.so:email"
    email =  reduce(lambda d, key: d.get(key, default) if isinstance(d, dict) else default, keys.split("."), dictionary)

    contact_name = name

		if contact_name == None:
			contact_name = ""
     
    if email != "" and email != None :
        contact_name='<a href="mailto:'+ email + '">' + contact_name +'</a>'
        contact_name = mark_safe(contact_name)

    return (contact_name) 

@register.simple_tag
def format_contributors(dictionary, list_key, default=None):
    contributors_list = dictionary.get(list_key, default)
    formatted_contributors = []

    if contributors_list and isinstance(contributors_list, list):
        for contributor in contributors_list:
            name_key = "so:name"
            email_key = "so:email"
            name = contributor.get(name_key, default)
            email = contributor.get(email_key, default)

            if email and email != default:
                formatted_name = '<a href="mailto:{email}">{name}</a>'.format(email=email, name=name)
                formatted_contributors.append(formatted_name)
            else:
                formatted_contributors.append(name)

    # Mark the entire concatenated string as safe
    return mark_safe(', '.join(formatted_contributors))

@register.simple_tag
def format_contributors_with_modals(contributors_list):
    html_output = []
    for index, contributor in enumerate(contributors_list):
        modal_id = f"contributorModal{index}"
        name = contributor.get("so:name", "N/A")
        email = contributor.get("so:email", "N/A")
        role = contributor.get("so:roleName", "N/A")
        orcid = contributor.get("orcid", "N/A")

        # Create the trigger link for the modal
        trigger_link = format_html('<a href="#" data-bs-toggle="modal" data-bs-target="#{}">{}</a>', modal_id, name)

        # Create the modal
        modal = format_html('''
            <div class="modal fade" id="{}" tabindex="-1" aria-labelledby="{}Label" aria-hidden="true">
                <div class="modal-dialog modal-sm"> 
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="{}Label">{}</h5>
                            <button type="button" class="close" data-bs-dismiss="modal" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div class="modal-body" style="max-height: 25vh; overflow-y: auto;">
                        <table class="table table-bordered"> <!-- Add table with borders -->
                        <tbody>
                        <tr><td>Email</td><td>{}</td></tr>
                        <tr><td>Role</td><td>{}</td></tr>
                        <tr><td>ORCID</td><td>{}</td></tr>
                        </tbody>
                        </table>
                        </div>
                    </div>
                </div>
            </div>
        ''', modal_id, modal_id, modal_id, name, email, role, orcid)

        # Append both the link and modal to the output
        html_output.append(trigger_link)
        html_output.append(modal)

    # Join all parts into a single string and mark it as safe for HTML rendering
    return mark_safe(''.join(html_output))


@register.simple_tag
def format_crop(dictionary, keys, default=None):
    name =  reduce(lambda d, key: d.get(key, default) if isinstance(d, dict) else default, keys.split("."), dictionary)
    split   = keys.split(".")
    url_key = split[0] + ".so:url"
    url     =  reduce(lambda d, key: d.get(key, default) if isinstance(d, dict) else default, url_key.split("."), dictionary)

    crop_name = name
     
    if  url != None :
        #print (crop_name, url)
        crop_name='<a href="'+ url + '">' + crop_name +'</a>'
        crop_name = mark_safe(crop_name)
    
    return (crop_name) 



@register.simple_tag
def format_address(dictionary, keys, default=None):
    name =  reduce(lambda d, key: d.get(key, default) if isinstance(d, dict) else default, keys.split("."), dictionary)
    
    print("check address: ", name)
    postalCode_key      = "address.address.Address.postalCode"
    addressLocality_key = "address.address.Address.addressLocality"
    addressCountry_key  = "address.address.Address.addressCountry"

    locality     =  reduce(lambda d, key: d.get(key, default) if isinstance(d, dict) else default, addressLocality_key.split("."), dictionary)
    country      =  reduce(lambda d, key: d.get(key, default) if isinstance(d, dict) else default, addressCountry_key.split("."), dictionary)
    postal_code  =  reduce(lambda d, key: d.get(key, default) if isinstance(d, dict) else default, postalCode_key.split("."), dictionary)

    address = name 

    #if locality != None and locality != name:
    #     address = address +'<br>'+ locality

    #if country != None and country != name:
    #     address = address +'<br>'+ country

    #if postal_code != None:
    #     address = address +'<br>'+ postal_code


    return (mark_safe(address)) 

@register.filter
def get_item(dictionary, key):
    return dictionary.get(key)
