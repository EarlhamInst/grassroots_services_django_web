import requests
import json

import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from io import BytesIO
import base64

from plotly.offline import plot
from plotly.graph_objs import Scatter
import plotly.express as px
import plotly.figure_factory as ff

from functools import reduce

############################################################################
def search_phenotype(list_observations, value):

    found = False
    for i in range(len(list_observations)):

        dic            = list_observations[i]
        phenotype_name = lookup_keys(dic, 'phenotype.variable')
        if  (phenotype_name == value ):
              return True
              break

    return found

###########################################################################
def search_phenotype_index(list_observations, value):

    for i in range(len(list_observations)):

        dic            = list_observations[i]
        phenotype_name = lookup_keys(dic, 'phenotype.variable')
        if  (phenotype_name == value ):
              return i
          

###################################################################
def searchPhenotypeTrait(listPheno, value):

    name = listPheno[value]['definition']['trait']['so:name']

    return name

###################################################################
def searchPhenotypeUnit(listPheno, value):

    name = listPheno[value]['definition']['unit']['so:name']

    return name



############################################################################################
'''
test rendering plotly interactive heatmap
'''
def plotly_plot(numpy_matrix, accession, title, unit, IDs, treatments, dates):

    ##numpy_matrix = np.flipud(numpy_matrix)      # To Match order shown originally in JS code
    #plotID      = np.flipud(IDs)        
    size = IDs.shape
    Y    = size[0]
    X    = size[1]

    indexInf     =  np.where(np.isinf(numpy_matrix))
    indexDiscard =  np.where(np.isnan(numpy_matrix))
    
    numpy_matrix[indexInf] = np.nan # Replace Inf by NaN

    strings     = np.array(["%s" % x for x in numpy_matrix])  #matrix has to be flattened for conversion to strings

    for i in range(len(strings)):   #remove decimal place when floats are integers
        string1 = strings[i]
        string_split = string1.split('.')
        if( len(string_split)==2):
            if(string_split[1]=='0'):
                integer = strings[i]
                integer = integer[:-2]
                strings[i] = integer
    

    strings[indexInf]     = 'N/A'    # use array of string for custumising hovering text
    strings[indexDiscard] = 'N/A'

    accession = accession.flatten()
    accession[indexDiscard] = 'Discarded'
    accession = accession.reshape(Y,X)                       

    s_matrix = strings.reshape(Y,X)                  
    s_matrix = np.flipud(s_matrix)      

    numpy_matrix[indexInf] = np.inf # but back inf (N/A values)
    numpy_matrix           = numpy_matrix.reshape(Y,X) 


    numpy_matrix = np.flipud(numpy_matrix)  # For matching order of JS table
    accession    = np.flipud(accession)        
    plotID       = np.flipud(IDs)        

    # Reverse Y ticks and start them from 1
    Yvals = np.arange(0,Y)
    Yaxis = np.arange(1,Y+1)
    Yaxis = np.flip(Yaxis)
    
    Xvals = np.arange(0, X)
    Xaxis = np.arange(1,X+1)

    units = 'Units: '+unit

    fig = px.imshow(numpy_matrix, aspect="auto",
            labels=dict(x="columns", y="rows", color=units),
            color_continuous_scale=px.colors.sequential.Greens, height=800 )

    if len(treatments)>0:
        treatments = treatments.reshape(Y,X)
        treatments = np.flipud(treatments)

        if len(dates)>0:  # Only include dates if they are not an empty list
            dates = dates.reshape(Y, X)
            dates = np.flipud(dates)
            fig.update_traces(
                customdata=np.moveaxis([accession, s_matrix, plotID, treatments, dates], 0, -1),
                hovertemplate="Accession: %{customdata[0]}<br>Raw value: %{customdata[1]}<br>Plot ID: %{customdata[2]} (column: %{x}, row: %{y})<br>Treatment: %{customdata[3]}<br>Date: %{customdata[4]}<extra></extra>"
            )
        else:
            fig.update_traces(
                customdata=np.moveaxis([accession, s_matrix, plotID, treatments], 0, -1),
                hovertemplate="Accession: %{customdata[0]}<br>Raw value: %{customdata[1]}<br>Plot ID: %{customdata[2]} (column: %{x}, row: %{y})<br>Treatment: %{customdata[3]}<extra></extra>"
            )


    else:
        if len(dates)>0:  # Only include dates if they are not an empty list
            dates = dates.reshape(Y, X)
            dates = np.flipud(dates)
            fig.update_traces(
                customdata=np.moveaxis([accession, s_matrix, plotID, dates], 0, -1),
                hovertemplate="Accession: %{customdata[0]}<br>Raw value: %{customdata[1]}<br>Plot ID: %{customdata[2]} (column: %{x}, row:%{y})<br>Date: %{customdata[3]}<extra></extra>"
            )
        else:
            fig.update_traces(
                customdata=np.moveaxis([accession, s_matrix, plotID], 0, -1),
                hovertemplate="Accession: %{customdata[0]}<br>Raw value: %{customdata[1]}<br>Plot ID: %{customdata[2]} (column: %{x}, row:%{y})<extra></extra>"
            )


    fig.update_layout(font=dict(family="Courier New, monospace",size=12,color="Black"),title={
        'text': title,
        'y':0.98,'x':0.5,
        'xanchor': 'center','yanchor': 'top'})

    fig.update_layout( yaxis = dict(tickmode = 'array', tickvals = Yvals, ticktext = Yaxis ) )
    fig.update_layout( xaxis = dict(tickmode = 'array', tickvals = Xvals, ticktext = Xaxis ) )


    fig.update_xaxes(showgrid=True, gridwidth=7, gridcolor='Black', zeroline=False)
    fig.update_yaxes(showgrid=True, gridwidth=7, gridcolor='Black', zeroline=False)
    fig['layout'].update(plot_bgcolor='black')

    #plot_div = plot([Scatter(x=x_data, y=y_data, mode='lines', name='test', opacity=0.8, marker_color='green')], output_type='div')
    plot_div = plot(fig, output_type='div')

    
    return plot_div

#########################################################################################################
def observation_dates(arraysJson, rows, columns, current_name):
    dt = np.dtype(('U', 80))  # Adjust dtype if date strings are longer
    matrix = np.zeros((rows, columns), dtype=dt)
    matrix[:] = "N/A"

    for r in range(len(arraysJson)):
        i = int(arraysJson[r]['row_index'])
        j = int(arraysJson[r]['column_index'])
        i = i - 1
        j = j - 1

        if 'observations' in arraysJson[r]['rows'][0]:
            # Filter observations by the selected phenotype
            relevant_observations = [
                obs for obs in arraysJson[r]['rows'][0]['observations'] if obs['phenotype']['variable'] == current_name
            ]

            if relevant_observations:
                # Sort observations by date and select the latest one
                relevant_observations.sort(key=lambda x: x.get('date', ''), reverse=True)
                latest_observation = relevant_observations[0]
                observation_date = latest_observation.get('date', 'N/A').split('T')[0]  # Keep only the date part
                matrix[i][j] = observation_date

    matrix = matrix.flatten()
    return matrix


############################################################################################
'''
test rendering seaborn image
'''
def seaborn_plot(numpy_matrix, title, unit):

    sns.set(rc={'figure.figsize':(17.5,8.0)})

    numpy_matrix = np.flipud(numpy_matrix)      # To Match order shown originally in JS code
    #print(numpy_matrix.shape)
    notAvailable = np.zeros_like(numpy_matrix)
    discarded    =  np.zeros_like(numpy_matrix)
    indexInf     =  np.where(np.isinf(numpy_matrix))
    indexDiscard =  np.where(np.isnan(numpy_matrix))
    notAvailable[indexInf]   = 1
    discarded[indexDiscard]  = 1
    NA        = np.where(notAvailable < 1, np.nan, notAvailable)
    discarded = np.where(   discarded < 1, np.nan, discarded)
    units = 'Units: '+ unit

    numpy_matrix[indexInf] = np.nan # Replace Inf by NaN

    # Reverse Y ticks and start them from 1
    size  = numpy_matrix.shape
    Y     = size[0]
    Yvals = np.arange(0.5, Y+0.5, 1.0)
    Yaxis = np.arange(1,Y+1)
    Yaxis = np.flip(Yaxis)

    X     = size[1]
    Xvals = np.arange(0, X)
    Xaxis = np.arange(1,X+1)


    maxVal = np.nanmax(numpy_matrix)
    minVal = np.nanmin(numpy_matrix)
    #print(minVal)
    colormap  = sns.light_palette("seagreen", as_cmap=True)
    dark      = sns.dark_palette((260, 75, 60), input="husl")
    sns.heatmap(NA, linewidth=0.5,cmap=dark, cbar=False )

    g = sns.heatmap(numpy_matrix,  vmax=maxVal, vmin=minVal,linewidth=0.5,cmap=colormap, cbar_kws={'label': units}) 
    ##g.set_facecolor('xkcd:black')

    g.patch.set_facecolor('white')
    g.patch.set_edgecolor('black')
    g.patch.set_hatch('xx')


    g.set_xlabel("Columns", fontsize = 14)
    g.set_ylabel("Rows", fontsize = 14)
    g.set_title(title, fontsize = 20)
    g.set_yticks( Yvals )
    g.set_yticklabels(Yaxis, size=10)
    g.tick_params(    axis='y', rotation=0)
    g.set_xticks(Xvals)
    g.set_xticklabels(Xaxis, size=10)
   

    fig = g.get_figure()
    mem = BytesIO()
    fig.savefig(mem, format='png')
    fig.savefig('heatnew.png')
    fig.clf()
    mem.seek(0)
    image = base64.b64encode(mem.getvalue()) # load the bytes in context as base64
    image = image.decode('utf8')
    mem.close()
     
    return image



#########################################################################################################
'''
create treatments array for plotly text 
'''
def treatments(arraysJson, rows, columns):

    dt= np.dtype(('U', 80))
    matrix = np.zeros((rows,columns), dtype=dt)
    matrix[:] = "N/A"

    for r in range(len(arraysJson)):
        if  ( 'discard' in arraysJson[r]['rows'][0] ):
            i = int( arraysJson[r]['row_index']    )
            j = int( arraysJson[r]['column_index'] )
            i=i-1
            j=j-1
            matrix[i][j] = 'N/A'
        elif  ( 'blank' in arraysJson[r]['rows'][0] ):
            i = int( arraysJson[r]['row_index']    )
            j = int( arraysJson[r]['column_index'] )
            i=i-1
            j=j-1
            matrix[i][j] = 'N/A'
    

        elif ( 'treatments' in arraysJson[r]['rows'][0] ):
            i = int( arraysJson[r]['row_index']    )
            j = int( arraysJson[r]['column_index'] )
            i=i-1
            j=j-1
            value = []
            label = []
            treat = []
            for k in range(len(arraysJson[r]['rows'][0]['treatments'])):
                    value  = np.append(value, arraysJson[r]['rows'][0]['treatments'][k]["so:sameAs"] )
                    label  = np.append(label, arraysJson[r]['rows'][0]['treatments'][k]["label"] )

            for m in range(len(value)):
                v1 = value[m]
                v2 = label[m]
                t  = v1 +' (' + v2 +')'        # combine name and label
                treat  = np.append(treat, t)  # to create single matrix that contains all the treatment(s) info.  
        
            #string = ', '.join(value)
            string = ', '.join(treat)
            matrix[i][j] = string

        ##else:
        ##    matrix[i][j] = np.inf.  Possible Warning? No treatment saved in plots...

    matrix  = matrix.flatten()
    return matrix


###################################################################
def dict_phenotypes(pheno, plots):

    names  = []
    traits = []
    
    for key in pheno:
        names.append(key)
        traits.append(pheno[key]['definition']['trait']['so:name'])

    phenoDict = dict(zip(names, traits))    # dictionary for the dropdown menu options

    for j in range(len(plots)):
        plot = plots [j]
        if (('rows' in plot) and (len (plot['rows']) > 0)):
            if ( 'discard' in plot['rows'][0] ):
                pass
            if ( 'blank' in plot['rows'][0] ):
                pass
            if ( 'guard' in plot['rows'][0] ):
                pass
        
            if ('observations' in plots[j]['rows'][0]):
                for k in range(len(plots[j]['rows'][0]['observations'])):
                    if ('raw_value' in plots[j]['rows'][0]['observations'][k]):
                        rawValue = plots[j]['rows'][0]['observations'][k]['raw_value']
                    if ('corrected_value' in plots[j]['rows'][0]['observations'][k]):
                        rawValue = plots[j]['rows'][0]['observations'][k]['corrected_value']
                    if ( type(rawValue) == str):                # Remove values that are strings,e.g., dates. 
                        name = plots[j]['rows'][0]['observations'][k]['phenotype']['variable']
                        if ( name in phenoDict.keys() ):
                            #print("check", phenoDict[name])
                            del phenoDict[name]

            #break

    return phenoDict

###############################################################################################################
'''
Create numpy arrays for plotly script. Matrix of raw values and matrix of accession 
'''
def numpy_data(json, pheno, current_name, total_rows, total_columns):
    if (('rows' not in json[0]) or (len (json [0] ['rows']) == 0)):
      return 
     
    test=json[0]['rows'][0]['study_index']

    if  "No Data" in pheno:
        print("No 'phenotypes' key in current study.")
        traitName = 'No Data'
        unit      = 'No Data'
    else:
        traitName = searchPhenotypeTrait(pheno, current_name)
        unit      = searchPhenotypeUnit( pheno, current_name)


    dtID= np.dtype(('U', 4))

    row_raw   = np.array([])
    matrix    = np.array([])
    row_acc   = np.array([])
    accession = np.array([])
    plotsIds  = np.array([], dtype=dtID)  #format of strings

    matrices = []

    max_value = np.array([])# new array to find the largest index in columns
    for j in range(len(json)):
         max_value = np.append(max_value, int(json[j]['column_index']) )

    num_columns = 1
    
    row    = 1
    column = 1
    #loop throght observations in the same fashion as in old JS code. 
    for j in range(len(json)):

        material_flag = 'material' in json[j]['rows'][0]

        
        if ( int( json[j]['row_index'] ) == row ):
            if  (int( json[j]['column_index'] ) == column): 
               if column > num_columns:
                   num_columns = column

               if   (( 'discard' in json[j]['rows'][0] ) or ( 'blank' in json[j]['rows'][0] )):
                    row_raw  = np.append(row_raw, np.nan )  # use NaN for discarded plots
                    row_acc  = np.append(row_acc, np.nan )  
                    plotsIds = np.append(plotsIds, json[j]['rows'][0]['study_index'] )
               elif ( not material_flag ):
                    row_raw  = np.append(row_raw, np.nan )  # use NaN for discarded plots
                    row_acc  = np.append(row_acc, "No accession" )  
                    plotsIds = np.append(plotsIds, json[j]['rows'][0]['study_index'] )
     
        
     
               elif ( 'observations' in json[j]['rows'][0] ):
                    if search_phenotype(json[j]['rows'][0]['observations'], current_name):
                        # Instead of getting the first match, we now sort the relevant observations by date
                        relevant_observations = [
                            obs for obs in json[j]['rows'][0]['observations'] if lookup_keys(obs, 'phenotype.variable') == current_name
                        ]
                        relevant_observations.sort(key=lambda x: x.get('date', ''), reverse=True)
                        latest_observation = relevant_observations[0]
                        #print("latest_observations -> ", latest_observation)

                        if 'raw_value' in latest_observation:
                            row_raw = np.append(row_raw, latest_observation['raw_value'])
                        if 'corrected_value' in latest_observation:
                            row_raw = np.append(row_raw, latest_observation['corrected_value'])

                        row_acc = np.append(row_acc, json[j]['rows'][0]['material']['accession'])
                        plotsIds = np.append(plotsIds, json[j]['rows'][0]['study_index'])
                    else:
                        row_raw = np.append(row_raw, np.inf)  # use infinity for N/A data
                        row_acc = np.append(row_acc, json[j]['rows'][0]['material']['accession'])
                        plotsIds = np.append(plotsIds, json[j]['rows'][0]['study_index'])

               else:
                  if('rows' in json[j]):      # when plots have rows but no observations!!
                        row_raw = np.append(row_raw, np.inf ) #   use infinity for N/A data
                        row_acc = np.append(row_acc, json[j]['rows'][0]['material']['accession'])  
                        plotsIds = np.append(plotsIds, json[j]['rows'][0]['study_index'] )  
         
  
               column+=1
               columns = json[j]['column_index']#

        elif ( int( json[j]['row_index'] ) > row  ):
            if column > num_columns:
                   num_columns = column

            if   (( 'discard' in json[j]['rows'][0] ) or ( 'blank' in json[j]['rows'][0] )):
                    row_raw  = np.append(row_raw, np.nan )  # use NaN for discarded plots
                    row_acc  = np.append(row_acc, np.nan )  
                    plotsIds = np.append(plotsIds, json[j]['rows'][0]['study_index'] )
            elif ( not material_flag ):
                    row_raw  = np.append(row_raw, np.nan )  # use NaN for discarded plots
                    row_acc  = np.append(row_acc, "No accession" )  
                    plotsIds = np.append(plotsIds, json[j]['rows'][0]['study_index'] )


            elif ( 'observations' in json[j]['rows'][0] ):
                    if search_phenotype(json[j]['rows'][0]['observations'], current_name):
                        # Instead of getting the first match, we now sort the relevant observations by date
                        relevant_observations = [
                            obs for obs in json[j]['rows'][0]['observations'] if lookup_keys(obs, 'phenotype.variable') == current_name
                        ]
                        relevant_observations.sort(key=lambda x: x.get('date', ''), reverse=True)
                        latest_observation = relevant_observations[0]
                        #print("latest_observations -> ", latest_observation)

                        if 'raw_value' in latest_observation:
                            row_raw = np.append(row_raw, latest_observation['raw_value'])
                        if 'corrected_value' in latest_observation:
                            row_raw = np.append(row_raw, latest_observation['corrected_value'])

                        row_acc = np.append(row_acc, json[j]['rows'][0]['material']['accession'])
                        plotsIds = np.append(plotsIds, json[j]['rows'][0]['study_index'])
                    else:
                        row_raw = np.append(row_raw, np.inf)  # use infinity for N/A data
                        row_acc = np.append(row_acc, json[j]['rows'][0]['material']['accession'])
                        plotsIds = np.append(plotsIds, json[j]['rows'][0]['study_index'])
            else:
                  if('rows' in json[j]):      # when plots have rows but no observations!!
                        row_raw = np.append(row_raw, np.inf ) #   use infinity for N/A data
                        row_acc = np.append(row_acc, json[j]['rows'][0]['material']['accession'])  
                        plotsIds = np.append(plotsIds, json[j]['rows'][0]['study_index'] )  
            

            row+=1
            column=2
            columns = json[j]['column_index']


    column = num_columns-1
    
    #if column<columns:
    #    column=columns #correction when only 1 row.

    column = int(np.max(max_value))
    
    #print("number of plots and shape check", len(json), row, column, row*(column) )
    if (len(json) != row*column):
        print("NOT rectangular")
        if(total_columns!=None):
           if(column<total_columns):
               column=total_columns
        # fit odd shape plot into bigger rectangular plot.
        row_raw  = oddShapeValues(   json, row, column, current_name)
        row_acc  = oddShapeAccession(json, row, column, current_name)
        plotsIds = oddShapePlotID(   json, row, column, current_name)
   
    matrices.append(row)
    matrices.append(column)
    matrices.append(row_raw)
    matrices.append(row_acc)
    matrices.append(traitName)
    matrices.append(unit)
    matrices.append(plotsIds)
    
    print("phenotype plotted:", current_name )
    return matrices

################################################################################################################################
def lookup_keys(dictionary, keys, default=None):
     return reduce(lambda d, key: d.get(key, default) if isinstance(d, dict) else default, keys.split("."), dictionary)

#############################################################################################################################
def oddShapeValues(arraysJson, rows, columns, phenotype):

    matrix = np.zeros((rows,columns))
    matrix[:] = np.nan

    for r in range(len(arraysJson)):
        if  ( 'discard' in arraysJson[r]['rows'][0] ):
            i = int( arraysJson[r]['row_index']    )
            j = int( arraysJson[r]['column_index'] )
            i=i-1
            j=j-1
            matrix[i][j] = np.nan
        elif  ( 'blank' in arraysJson[r]['rows'][0] ):
            i = int( arraysJson[r]['row_index']    )
            j = int( arraysJson[r]['column_index'] )
            i=i-1
            j=j-1
            matrix[i][j] = np.nan

        elif ( 'observations' in arraysJson[r]['rows'][0] ):
            i = int( arraysJson[r]['row_index']    )
            j = int( arraysJson[r]['column_index'] )
            i=i-1
            j=j-1
            if( search_phenotype(arraysJson[r]['rows'][0]['observations'], phenotype) ):
                indexCurrentPhenotype = search_phenotype_index (arraysJson[r]['rows'][0]['observations'], phenotype)
                if ('raw_value' in arraysJson[r]['rows'][0]['observations'][indexCurrentPhenotype]):
                    rawValue = arraysJson[r]['rows'][0]['observations'][indexCurrentPhenotype]['raw_value']
                if ('corrected_value' in arraysJson[r]['rows'][0]['observations'][indexCurrentPhenotype]):
                    rawValue = arraysJson[r]['rows'][0]['observations'][indexCurrentPhenotype]['corrected_value']
                matrix[i][j] = rawValue
            else:
                matrix[i][j] = np.inf

        else:
            if('rows' in arraysJson[r]):        #rows field exists but it has no observations!
               i = int( arraysJson[r]['row_index']    )
               j = int( arraysJson[r]['column_index'] )
               i=i-1
               j=j-1
               matrix[i][j] = np.inf  # consider it N/A instead as default discarded (nan)
    

    #matrix = np.flipud(matrix)
    #print(matrix)
    matrix  = matrix.flatten()

    return matrix
#######################################################################
def oddShapeAccession(arraysJson, rows, columns, phenotype):

    dt= np.dtype(('U', 50)) # define string type for of strings (accession names)
    matrix = np.empty((rows,columns), dtype=dt)
    matrix[:] = 'Discarded' #  hovering text in empty plots

    for r in range(len(arraysJson)):
        if  ( 'discard' in arraysJson[r]['rows'][0] ):
            i = int( arraysJson[r]['row_index']    )
            j = int( arraysJson[r]['column_index'] )
            i=i-1
            j=j-1
            matrix[i][j] = np.nan         #discarded plot
        elif  ( 'blank' in arraysJson[r]['rows'][0] ):
            i = int( arraysJson[r]['row_index']    )
            j = int( arraysJson[r]['column_index'] )
            i=i-1
            j=j-1
            matrix[i][j] = np.nan         #discarded plot

        elif ( 'observations' in arraysJson[r]['rows'][0] ):
            i = int( arraysJson[r]['row_index']    )
            j = int( arraysJson[r]['column_index'] )
            i=i-1
            j=j-1
         #   if( search_phenotype(arraysJson[r]['rows'][0]['observations'], phenotype) ):
            matrix[i][j] = arraysJson[r]['rows'][0]['material']['accession']
        elif('rows' in arraysJson[r]):
            i = int( arraysJson[r]['row_index']    )
            j = int( arraysJson[r]['column_index'] )
            i=i-1
            j=j-1
            matrix[i][j] = arraysJson[r]['rows'][0]['material']['accession']


    matrix  = matrix.flatten()

    return matrix


#######################################################################
def oddShapePlotID(arraysJson, rows, columns, phenotype):

    dt= np.dtype(('U', 40))
    matrix = np.empty((rows,columns), dtype=dt)
    matrix[:] = 'N/A'

    for r in range(len(arraysJson)):
        if  ( 'discard' in arraysJson[r]['rows'][0] ):
            i = int( arraysJson[r]['row_index']    )
            j = int( arraysJson[r]['column_index'] )
            i=i-1
            j=j-1
            matrix[i][j] = arraysJson[r]['rows'][0]['study_index']

        elif ( 'observations' in arraysJson[r]['rows'][0] ):
            i = int( arraysJson[r]['row_index']    )
            j = int( arraysJson[r]['column_index'] )
            i=i-1
            j=j-1
            if( search_phenotype(arraysJson[r]['rows'][0]['observations'], phenotype) ):
                matrix[i][j] = arraysJson[r]['rows'][0]['study_index']
            else:
            #    matrix[i][j] = np.nan    # No values for that phenotype
                matrix[i][j] = arraysJson[r]['rows'][0]['study_index']



    matrix  = matrix.flatten()

    return matrix




