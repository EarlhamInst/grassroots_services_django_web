//var plotsHTMLArray = {};
//var plotsGRUArray = [];
// plots json from backend
var plot_json = [];
//var plotsPhenotypeArray = [];
// var global_width = 0;
// var global_height = 0;

// colours used for replicates
var colorJSON = {
    1: "#39CCCC",
    2: "#FFDC00",
    3: "#01FF70",
    4: "#FF851B",
    5: "#F012BE",
    6: "#FF4136",
    7: "#3D9970",
    8: "#ABEBC6",
    9: "#2ECC40",
};

// plots details
var plotsModalInfo = {};
var plotsInfoGPS =   {};  //NEW variable for hovering table over GPS maps of single studies.

// treatment table
var s_formatted_treatments = [];

//  @param {string} type_param - type of the display, can be Grassroots:FieldTrial, Grassroots:Study or AllFieldTrials.
var type_param_global = '';

// for jquery sliders
var datemin = 0;
var datemax = 0;

var currentImageIndex = 0;
//var combinedImages = [];

//function changeImage(direction) {


//function formatDateFromFilename(filename) {


//combinedImages.forEach((image, index) => {
//    const dateTitle = formatDateFromFilename(image.thumbnail); // Extract date from thumbnail filename
//    htmlarray.push(`<a href="${image.contentUrl}" target="_blank"><img class="carouselImage" src="${image.thumbnail}" style="max-width: 100%; display: ${index === 0 ? 'block' : 'none'};" height="300" onerror="this.onerror=null; this.src='fallback.jpg';"/><span class="image-title">${dateTitle}</span></a>`);
//});

/**
 * Start field trial map and table
 *
 * @param {JSONArray} jsonArray - JSONArray from backend containing all field trial info.
 * @param {string} type_param - type of the display, can be Grassroots:FieldTrial, Grassroots:Study or AllFieldTrials.
 */
function startFieldTrialGIS(jsonArray, type_param) {
    type_param_global = type_param;
    //console.log(JSON.stringify(jsonArray));
    var filtered_data_with_location = [];
    var filtered_data_without_location = [];
    jQuery('#status').html('');
    var fieldTrialName = '';
    var team = '';
    var fieldTrialId = '';
    for (i = 0; i < jsonArray.length; i++) {
        if (type_param === 'Grassroots:FieldTrial') {
            fieldTrialName = jsonArray[i]['data']['so:name'];
            team = jsonArray[i]['data']['team'];
            fieldTrialId = jsonArray[i]['data']['_id']['$oid'];
            if (jsonArray[i]['data']['studies'] != null) {
                for (j = 0; j < jsonArray[i]['data']['studies'].length; j++)
                    if (jsonArray[i]['data']['studies'][j]['address'] != undefined) {
                        if (jsonArray[i]['data']['studies'][j]['address']['address']['location']['centre'] != undefined) {
                            var study_json = jsonArray[i]['data']['studies'][j];
                            // study_json["team"] = team;
                            // study_json["parent_field_trial_name"] = fieldTrialName;
                            // study_json["parent_field_trial_id"] = fieldTrialId;
                            filtered_data_with_location.push(study_json);
                        }
                    } else {
                        var study_json = jsonArray[i]['data']['studies'][j];
                        // study_json["team"] = team;
                        // study_json["so:name"] = fieldTrialName;
                        filtered_data_without_location.push(study_json);
                    }
            } else {
                filtered_data_without_location.push(jsonArray[i]['data']);
            }
        } else if (type_param === 'Grassroots:Study' || type_param === 'AllFieldTrials') {
            var study_json = jsonArray[i]['data'];
            study_json["team"] = '';
            // study_json["so:name"] = fieldTrialName;
            filtered_data_with_location.push(study_json);
        }
    }
    if (type_param === 'Grassroots:FieldTrial') {
        $('#description').append(' ' + fieldTrialName);
    } else if (type_param === 'Grassroots:Study') {
        $('#description').append(' ' + fieldTrialName);
        $('#title').append(' Study');
    }
    if (type_param === 'Grassroots:Study') {
        let experimental_area_json = jsonArray[0]['data'];
        // two column study details table
        //  remove reference in order to use the new table in study.html template. NOV 2023 
        //jQuery('#tableWrapper').html('<br/><br/>' + create_study_info_html(experimental_area_json));
        //$('.table').DataTable({
        //    "ordering": false,
        //    "paging": false,
        //    "searching": false,
        //    "info": false
        //});

        s_formatted_treatments = generate_treatments_html(experimental_area_json);
        if (experimental_area_json['plots'] !== undefined && experimental_area_json['plots'] !== null) {
            for (j = 0; j < experimental_area_json['plots'].length; j++) {
                let plot = experimental_area_json['plots'][j];
		allPhenotypes =  experimental_area_json['phenotypes'];  // global variable with all phenotypes of particular study
                if (plot['rows'].length > 0) {
                    if (plot['rows'][0]['study_index'] !== undefined) {
                        let plotId = plot['rows'][0]['study_index'];
                        plotsModalInfo[plotId] = formatPlotModal(plot);
                        plotsInfoGPS[plotId]   = formatGPSPlot(plot, experimental_area_json['study_design']);   // NEW variable for tables over maps
			
                        // show other plots info, but performance issue
                        // let searchStr = '';
                        //
                        // for (r = 0; r < plot['rows'].length; r++) {
                        //     let this_accession = SafePrint(plot['rows'][r]['material']['accession']);
                        //     get_GRU_by_accession(this_accession, plotId, r);
                        //     searchStr = this_accession;
                        // }
                        //
                        //
                        // for (j = 0; j < plot_json.length; j++) {
                        //     const loop_plotId = plot_json[j]['_id']['$oid'];
                        //     if (loop_plotId !== plotId) {
                        //         var rows = plot_json[j]['rows'];
                        //         for (jr = 0; jr < rows.length; jr++) {
                        //             var accession = rows[jr]['material']['accession'];
                        //             if (accession != undefined) {
                        //                 if (searchStr === accession && searchStr !== '') {
                        //                     let formatted_plot = format_plot_rows(plot_json[j], true);
                        //                     $('#rowsInfo').append(formatted_plot['rowsInfo'].join(""));
                        //                     $('#phenotypes').append(formatted_plot['phenotypes'].join(""));
                        //                     break;
                        //                 }
                        //             }
                        //         }
                        //     }
                        //
                        // }

                        //
                        // $('#plots_table').DataTable({
                        //     "aaSorting": [],
                        //     "lengthMenu": [[100, 500, -1], [100, 500, "All"]]
                        // });
                        // $('#plots_table_rows').DataTable({
                        //     "aaSorting": [],
                        //     "lengthMenu": [[100, 500, -1], [100, 500, "All"]]
                        // });
                    }
                }
            }
        }


    } else {
          produceFieldtrialTable(filtered_data_without_location.concat(filtered_data_with_location), type_param);

    }

    displayFTLocations(filtered_data_with_location, type_param);

/*    if (type_param !== 'AllFieldTrials') { */
    if (type_param === 'Grassroots:Study') {
	  create_study_modal_html(filtered_data_without_location.concat(filtered_data_with_location));
    }
    if (type_param === 'AllFieldTrials' || type_param === 'Grassroots:FieldTrial') {

     // fix behaviour of popover (Download column, Friccionless info) in main table  
     $('#download_question').popover({
     content: 'A Frictionless Data Package contains all of the data associated with a study including its parent field trial and programme. For more information and the tool to unpack these packages, go <a class="newstyle_link" href="https://grassroots.tools/frictionless-data/grassroots-fd-client.md" target="_blank">here</a>',
     html: true,
     placement: 'left',
     trigger: 'manual',
     animation: false,
     container: 'body'
     });

        var isPopoverVisible = false;  // state to track if the popover is currently visible or not
        $('#download_question').on('mouseenter', function() {
     if (isPopoverVisible) {
        console.log("Mouse entered and hiding the popover.");
        $(this).popover('hide');
        isPopoverVisible = false;
     } else {
        console.log("Mouse entered and showing the popover.");
        $(this).popover('show');
        isPopoverVisible = true;
     }
        });

        $(document).on('click', function(event) {
     var $popoverElement = $('#download_question');

     // If click is outside the popover and the interrogation sign, hide the popover
     if (!$popoverElement.is(event.target) && $popoverElement.has(event.target).length === 0 && $('.popover').has(event.target).length === 0) {    
        if (isPopoverVisible) {
            $popoverElement.popover('hide');
            isPopoverVisible = false;
        }
     }
        });

        // Added scroll event listener
        $(window).on('scroll', function() {
     if (isPopoverVisible) {
        $('#download_question').popover('hide');
        isPopoverVisible = false;
     }
        });
    
    }
/*
//-------- NEW CODE FOR BOOSTRAP 5 -------- //
    var popoverElement = document.querySelector('#download_question');
    var popoverInstance = new bootstrap.Popover(popoverElement, {
    content: 'A Frictionless Data Package contains all of the data associated with a study including its parent field trial and programme. For more information and the tool to unpack these packages, go <a class="newstyle_link" href="https://grassroots.tools/frictionless-data/grassroots-fd-client.md" target="_blank">here</a>',
    html: true,
    placement: 'left',
    trigger: 'manual',
    animation: false,
    container: 'body'
    });

    var isPopoverVisible = false;  // state to track if the popover is currently visible or not

    popoverElement.addEventListener('mouseenter', function() {
    if (isPopoverVisible) {
    console.log("Mouse entered and hiding the popover.");
    popoverInstance.hide();
    isPopoverVisible = false;
    } else {
    console.log("Mouse entered and showing the popover.");
    popoverInstance.show();
    isPopoverVisible = true;
    }
    });

    document.addEventListener('click', function(event) {
    // If click is outside the popover and the interrogation sign, hide the popover
    if (!popoverElement.contains(event.target) && event.target !== popoverElement) {
    console.log("Document clicked outside the popover.");
    if (isPopoverVisible) {
        popoverInstance.hide();
        isPopoverVisible = false;
    }
    }
    });

    // Added scroll event listener
    window.addEventListener('scroll', function() {
    if (isPopoverVisible) {
    console.log("Page scrolled, hiding the popover.");
    popoverInstance.hide();
    isPopoverVisible = false;
    }
    });
//-------- NEW CODE FOR BOOSTRAP 5 -------- //
// ------------------------
*/





}

/**
 * Create field trial DataTable, for listing all fieldtrial page and single field trial page
 *
 * @param {JSONArray} data - JSONArray from backend containing all field trial info.
 * @param {string} type_param - type of the display, can be Grassroots:FieldTrial, Grassroots:Study or AllFieldTrials.
 */
function produceFieldtrialTable(data, type_param) {
     //yrtable.clear();
     //yrtable.destroy();
    yrtable = jQuery('#resultTable').DataTable({
        data: data,
        "aaSorting": [],
        "scrollX": true,
        "columns": [
            {
                title: "Programme",
                "render": function (data, type, full, meta) {
                    return format_study_parent_program(full);

                }
            },
            {
                title: "Field Trial",
                render: function (data, type, full, meta) {

                    var ft_name = "";

                    if (full['parent_field_trial'] !== undefined) {

                        var ftId = full['parent_field_trial']['_id']['$oid'];
                        var name = SafePrint(full['parent_field_trial']['so:name']);

                        ft_name = '<a href="' + root_dir + 'fieldtrial/' + ftId +
                                '" target="_blank">' + name + '</a>';
                    }

                    return ft_name;
                }
            },
            {
                title: "Study",
                "render": function (data, type, full, meta) {
                    var studyId = full['_id']['$oid'];
                    let study_result = '<a href="' + root_dir + 'fieldtrial/study/' + studyId + '" target="_blank">' + full['so:name'] + '</a>';

                    return study_result;
                }
            },
            {
                title: "Team",
                "render": function (data, type, full, meta) {
                     if (full['parent_field_trial'] !==undefined)
                         return SafePrint(full['parent_field_trial']['team']);
                     return '';
                }
            },
            {
                title: "Description",
                "render": function (data, type, full, meta) {
                    return SafePrint(full['so:description']);
                }
            },
            {
                title: "Sowing Year",
                "render": function (data, type, full, meta) {
                    if (full['sowing_year'] != undefined) {
                        return full['sowing_year'];
                    } else {
                        return '';
                    }
                }
            },
            {
                title: "Harvest Year",
                "render": function (data, type, full, meta) {
                    if (full['harvest_year'] != undefined) {
                        return full['harvest_year'];
                    } else {
                        return '';
                    }
                }
            },
            {
                title: "Plots",
                "render": function (data, type, full, meta) {
                    return get_study_plots_link(full);
                }
            },
            {
                title: "Address",
                "render": function (data, type, full, meta) {
                    return get_study_address(full, true);
                }
            },
/* redundant column. 
		{
                title: "Shape Data",
                "render": function (data, type, full, meta) {
                    let shape_link = '';
                    if (full['has_shape_data'] !== null && full['has_shape_data'] !== undefined && full['has_shape_data'] !== '') {
                        // old shape data link, comment below for new link
                        //shape_link = '<u class="newstyle_link">View</u>';
                        // uncomment below to use the new has_shape_data to study page plus comment from line 337-359
                        if (full['has_shape_data']) {
                            var studyId = full['_id']['$oid'];
                           shape_link = '<a href="' + root_dir + 'fieldtrial/study/' + studyId + '" target="_blank">View</a>';
                        }
                    }
                    return shape_link;
                }
            },
*/
            {
                title: "Treatment Factors",
                "render": function (data, type, full, meta) {
		// Create treatment factors tables for modal links
		    var studyId = full['_id']['$oid'];
			if (full['treatment_factors'] !== undefined) {
		            if (full['treatment_factors'] !== null) {
                		if (full['treatment_factors'].length !== 0) {
	                    plotsModalInfo[studyId + 'treatment'] = generate_treatments_html(full);
        	        	}
        	    	    }
        		}
                    return format_study_treatment_factors_link(full);
                }
            }
            ,
            {
                title: "Contacts",
                "render": function (data, type, full, meta) {
                    // var study_result = '';
                    return format_study_contacts(full);
                }
            },
            {
		title: 'Download<i id="download_question" class="fas fa-question newstyle_link"></i>',
                "render": function (data, type, full, meta) {
                    var download = '';
                    if (full['so:contentUrl'] !== undefined) {
                        var link = full['so:contentUrl'];
                        download = '<a  class="newstyle_link" target="_blank" href="' + link + '" download>Frictionless Data Package</a>'
                    }
                    return download;
                }
            }

        ]

    });

    // for address columns click and zoom in on the map
    jQuery('#resultTable tbody').on('click', 'td', function () {
        var cellIdx = yrtable.cell(this).index();
        console.log(cellIdx);
        var rowIdx = cellIdx['row'];
        var json = yrtable.row(rowIdx).data();
        let lalo = [];
        if (json['address'] !== undefined && cellIdx['column'] === 8) {
            if (json['address']['address']['location']['centre'] !== undefined) {
                var la = json['address']['address']['location']['centre']['latitude'];
                var lo = json['address']['address']['location']['centre']['longitude'];
                map.setView([la, lo], 18, {animate: true});
                $(window).scrollTop($('#map').offset().top - 90);

            }
        }
        // Shape data listing page link, comment below from line 337-359  when has_shape_data is in place
/*
        else if (json['shape_data'] !== null && json['shape_data'] !== undefined && json['shape_data'] !== '' && cellIdx['column'] === 9) {

            if (json['address']['address']['location']['centre'] !== undefined) {
                var la = json['address']['address']['location']['centre']['latitude'];
                var lo = json['address']['address']['location']['centre']['longitude'];
                lalo = [la, lo];
            }

            // let shape_data = JSON.parse(json['shape_data']);
            let shape_data = json['shape_data'];
            let coord = shape_data.features[0].geometry.coordinates;
            let zoom = 18;
            if (coord[0][0].length === 2) {
                lalo = coord[0][0][0].reverse();
                zoom = 22;
            } else if (coord[0][0][0].length === 2) {
                lalo = coord[0][0][0].reverse();
                zoom = 22;
            }

            map.setView(lalo, zoom, {animate: true});
            $(window).scrollTop($('#map').offset().top - 90);
        }
*/
    });

    // if (type_param === 'Grassroots:Study'){
    //     yrtable.column( 11 ).visible( false );
    // }

    if (type_param === 'AllFieldTrials') {
        // hide treatment factors column
        yrtable.column(10).visible(false);
        // console.log("server search here");
        // jQuery('#resultTable').on('search.dt', function () {
        //     removePointers();
        //     var search_value = $('.dataTables_filter input').val();
        //     var req_json = CreatePlotsRequestForAllFieldTrials(search_value);
        //
        //     console.log("server search query " + JSON.stringify(req_json));
        //
        //     if (req_json) {
        //         $.ajax({
        //             type: "POST",
        //             headers: {
        //                 'X-CSRFToken': csrftoken
        //             },
        //             url: root_dir + "service/ajax/interact_backend/",
        //             data: JSON.stringify(req_json),
        //             dataType: "json",
        //             contentType: "application/json; charset=utf-8"
        //         }).done(function (ft_json) {
        //             console.log("server search response " + JSON.stringify(ft_json));
        //             if (ft_json['results'][0]['results'] != undefined) {
        //
        //                 // yrtable.destroy();
        //                 $('#tableWrapper').html('  <div id="tableWrapper">\n' +
        //                     '            <table id="resultTable"></table>\n' +
        //                     '        </div>');
        //                 startFieldTrialGIS(ft_json['results'][0]['results'], type_param);
        //                 $('.dataTables_filter input').val(search_value);
        //             }
        //         }).fail(function (req, status, error) {
        //             console.info("req " + "status " + status + " error " + error);
        //         });
        //     }
        // });
    }
    // else {
    // search with map updates
    jQuery('#resultTable').on('search.dt', function () {
        removePointers();
        var searchData = yrtable.rows({filter: 'applied'}).data().toArray();
        var search_data = [];
        for (i = 0; i < searchData.length; i++) {
            if (searchData[i]['address']['address'] != undefined) {
                if (searchData[i]['address']['address']['location']['centre'] != undefined) {
                    search_data.push(searchData[i]);
                }
            }
        }
        displayFTLocations(search_data, type_param);
    });

    // }
    // sliders for harvest year
    jQuery("#slider").bind("valuesChanging", function (e, data) {
        datemin = data.values.min;
        datemax = data.values.max;

        yrtable.draw();
    });
    // slider values comparison
    jQuery.fn.dataTableExt.afnFiltering.push(
        function (oSettings, aData, iDataIndex) {
            var dateStart = datemin;
            var dateEnd = datemax;

            var evalDate = aData[6];

            if (((evalDate >= dateStart && evalDate <= dateEnd) || (evalDate >= dateStart && dateEnd == 0)
                || (evalDate >= dateEnd && dateStart == 0)) || (dateStart == 0 && dateEnd == 0)) {
                return true;
            } else {
                return false;
            }

        });

}


/**
 * Get study address and return formatted string
 *
 * @param {JSON} full - Study JSON.
 * @param {bool} link_bool - Boolean to make returned text formatted as a link with styling.
 */
function get_study_address(full, link_bool) {
    var addressInfo = '';
    if (full['address'] !== undefined && full['address']['address'] !== "undefined") {
        if (full['address'] !== undefined && full['address'] !== "undefined") {
            var address_name = (full['address']['name'] != undefined) ? full['address']['name'] + '<br/>' : "";
            //var address_name = (full['address']['address']['Address']['name'] != undefined) ? full['address']['address']['Address']['name'] + '<br/>' : "";
	    //var address_locality = (full['address']['address']['Address']['addressLocality'] != undefined) ? full['address']['address']['Address']['addressLocality'] + '<br/>' : "";
            //var address_country = (full['address']['address']['Address']['addressCountry'] != undefined) ? full['address']['address']['Address']['addressCountry'] + '<br/>' : "";
            //var address_postcode = (full['address']['address']['Address']['postalCode'] != undefined) ? full['address']['address']['Address']['postalCode'] : "";

            var link = (link_bool) ? 'class="newstyle_link"' : "";

            addressInfo = '<span ' + link + '> ' + address_name + '</span>';
               // + address_locality
               // + address_country
               // + address_postcode + '</span>';
        }
    }
    return addressInfo;
}


/**
 * Create study plots page link, if no plots it will return an empty string
 *
 * @param {JSON} full - Study JSON.
 */
function get_study_plots_link(full) {
    if (check_plots(full)) {
        var id = full['_id']['$oid'];

        /* remove the quotes */
        id = id.replace(/"/g, "");

        return '<a class=\"newstyle_link\" href=\"' + root_dir + 'fieldtrial/plots/' + id + '\"  target=\"_blank\">View plots</a>';
    } else {
        return '';
    }
}

/**
 * Check if study has plots, return a boolean
 *
 * @param {JSON} full - Study JSON.
 */
function check_plots(full) {
    if (full['_id'] != undefined) {
        if (full['number_of_plots'] != undefined) {
            if (full['number_of_plots'] > 0) {
                return true;
            }
        }
        if (full['plots'] != undefined) {
            if (full['plots'].length > 0) {
                return true;
            }
        } else {
            return false;
        }
    } else {
        return false;
    }
}

/**
 * Create modal html and stored in plotsModalInfo global var.
 *
 * @param {JSONArray} array - JSONArray of studies.
 */
function create_study_modal_html(array) {
    for (i = 0; i < array.length; i++) {
        var studyJson = array[i];
        var studyId = studyJson['_id']['$oid'];

        plotsModalInfo[studyId] = create_study_info_html(studyJson);

        if (studyJson['treatment_factors'] !== undefined) {
            if (studyJson['treatment_factors'] !== null) {
                if (studyJson['treatment_factors'].length !== 0) {
                    plotsModalInfo[studyId + 'treatment'] = generate_treatments_html(studyJson);
                }
            }
        }
    }

}

/**
 * Format programme info for a given study
 *
 * @param {JSON} full - Study JSON.
 */
function format_study_parent_program(full) {
    let result = '';
    if (full['parent_program'] !== undefined && full['parent_program'] !== null) {
        if ((full['parent_program']['so:image'] !== undefined) && (full['parent_program']['so:image'] !== null)) {
            result = result + ' <img src="' + full['parent_program']['so:image'] + '" height="32px;"/><br/> ';
        }
        if (full['parent_program']['so:name'] !== undefined) {
            result = result + ' ' + SafePrint(full['parent_program']['so:name']) + '<br/>';
        }
        if (full['parent_program']['principal_investigator'] !== undefined) {
            let pi_name = full['parent_program']['principal_investigator']['so:name'];
            if (full['parent_program']['principal_investigator']['so:email'] !== undefined) {
                let pi_email = full['parent_program']['principal_investigator']['so:email'];
                result = result + ' <a href="mailto:' + pi_email + '" target="_blank">' + pi_name + '</a>';
            } else {
                result = result + ' ' + SafePrint(pi_name);
            }
        }
    }
    return result;
}

/**
 * Format both contact and curator info for a given study
 *
 * @param {JSON} full - Study JSON.
 */
function format_study_contacts(full) {
    var curator = format_study_curator(full);
    var contact = format_study_contact(full);

    if (curator !== '') {
        curator = 'Curator: ' + curator;
    }

    if (contact !== '') {
        contact = 'Contact: ' + contact;
    }

    return curator + '<br/>' + contact;
}

/**
 * Format curator info for a given study
 *
 * @param {JSON} full - Study JSON.
 */
function format_study_curator(full) {
    var study_result = '';
    if (full['curator'] !== undefined && full['curator'] !== null) {
        let curator_name = full['curator']['so:name'];
        if (full['curator']['so:email'] !== undefined && full['curator']['so:email'] !== null) {
            let curator_email = full['curator']['so:email'];
            study_result = '<a href="mailto:' + curator_email + '" target="_blank">' + SafePrint(curator_name) + '</a>';
        } else {
            study_result = SafePrint(curator_name);
        }

    }
    return study_result;

}

/**
 * Format contacts info for a given study
 *
 * @param {JSON} full - Study JSON.
 */
function format_study_contact(full) {
    var study_result = '';
    if (full['contact'] !== undefined && full['contact'] !== null) {
        let contact_name = full['contact']['so:name'];
        if (full['contact']['so:email'] !== undefined && full['contact']['so:email'] !== null) {
            let contact_email = full['contact']['so:email'];
            study_result = '<a href="mailto:' + contact_email + '" target="_blank">' + SafePrint(contact_name) + '</a>';
        } else {
            study_result = SafePrint(contact_name);
        }
    }
    return study_result;

}

/**
 * Format treatments link info for a given study
 *
 * @param {JSON} full - Study JSON.
 */
function format_study_treatment_factors_link(full) {
    var studyId = full['_id']['$oid'];
    var treatment = '';

    //console.log ("treatment_factors: ");
    //console.log (JSON.stringify (full['treatment_factors'])); 
    
    if ((full['treatment_factors'] !== undefined) && (full['treatment_factors'] !== null) && (type_param_global !== 'AllFieldTrials')) {
        if (full['treatment_factors'].length > 0) {
            treatment = '<span style="cursor:pointer;" class="newstyle_link" onclick="plotModal(\'' + studyId + 'treatment\')">Treatment Factors</span>'
        }
    }

    return treatment;
}

/**
 * Format crop info for a given study
 *
 * @param {JSON} crop_json - Study crop JSON.
 */
function format_crop(crop_json) {
    var crop = '';
    if (crop_json !== undefined && crop_json !== null) {
        if (crop_json['so:name'] !== undefined) {
            crop = crop_json['so:name'];
            if (crop_json['so:url'] !== undefined) {
                crop = '<a href="' + crop_json['so:url'] + '" target="_blank">' + crop_json['so:name'] + '</a>';
            }
        }
    }
    return crop;
}

/**
 * Format all info for a given study into a table, this is used in the study page and map marker popup info
 *
 * @param {JSON} studyJson - Study JSON.
 */
function create_study_info_html(studyJson) {
    studyID = studyJson["_id"]["$oid"] //2023 for CSV file name and  link	
    var htmlarray = [];
    htmlarray.push('<table class="table table-bordered">');
    htmlarray.push('<thead>');

    htmlarray.push('<tr>');
    htmlarray.push('<th width="50%">');
    htmlarray.push('<strong>Study Info</strong> ');
    htmlarray.push('</th>');
    htmlarray.push('<th width="50%">');
    htmlarray.push('<strong>Values</strong> ');
    htmlarray.push('</th>');
    htmlarray.push('</tr>');
    htmlarray.push('<thead>');
    htmlarray.push('<tbody>');

    AddTableRow (htmlarray, "Study Name", studyJson ['so:name']);

    AddTableRow (htmlarray, "Study Description", studyJson ['so:description']);

    if (studyJson["parent_program"] !== undefined) {
        AddTableRow (htmlarray, "Programme", format_study_parent_program (studyJson));
    }

    if (studyJson["parent_field_trial"] !== undefined) {
        let ftId = studyJson['parent_field_trial']['_id']['$oid'];
        let ft_name = '<a target="_blank" style="newstyle_link" href="' + root_dir + 'fieldtrial/' + ftId + '" target="_blank">' + studyJson['parent_field_trial']['so:name'] + '</a>';

        AddTableRow (htmlarray, "Field Trial Name", ft_name);
    }


    AddTableRow (htmlarray, "Study Design", SafePrint(studyJson['study_design']));

    AddTableRow (htmlarray, "Changes to Experiment Plan", SafePrint(studyJson['plan_changes']));

    AddTableRow (htmlarray, "Growing Conditions", SafePrint(studyJson['growing_conditions']));

    AddTableRow (htmlarray, "Phenotype Gathering Notes", SafePrint(studyJson['phenotype_gathering_notes']));

    AddTableRow (htmlarray, "Physical Samples Collected", SafePrint(studyJson['physical_samples_collected']));

    AddTableRow (htmlarray, "Data not included", SafePrint(studyJson['data_not_included']));

    AddTableRow (htmlarray, "Team", SafePrint(studyJson["parent_field_trial"]['team']));

    AddTableRow (htmlarray, "Slope", SafePrint(studyJson['envo:00002000']));

    if (studyJson["ncit:C42677"] !== undefined) {
        let aspect_link = '<a target="_blank" style="newstyle_link" href="' + studyJson["ncit:C42677"]  + '" target="_blank">' + studyJson["ncit:C42677"] + '</a>';

        AddTableRow (htmlarray, "Aspect", aspect_link);
    }

    AddTableRow (htmlarray, "Weather", SafePrint(studyJson['weather']));

    if (studyJson['current_crop'] !== undefined) {
        AddTableRow (htmlarray, "Current Crop", format_crop(studyJson['current_crop']));
    }

    if (studyJson['previous_crop'] !== undefined) {
        AddTableRow (htmlarray, "Previous Crop", format_crop(studyJson['previous_crop']));
    }

    AddTableRow (htmlarray, "Sowing Year", SafePrint(studyJson['sowing_year']));

    AddTableRow (htmlarray, "Harvest Year", SafePrint(studyJson['harvest_year']));

    AddTableRow (htmlarray, "Plots", get_study_plots_link(studyJson));

    AddTableRow (htmlarray, "Address", get_study_address(studyJson, false));


    AddTableRow (htmlarray, "Treatment Factors", format_study_treatment_factors_link(studyJson));


    AddTableRow (htmlarray, "Curator", format_study_curator(studyJson));

    AddTableRow (htmlarray, "Contact", format_study_contact(studyJson));

    AddTableRow (htmlarray, "Images collected", SafePrint(studyJson['image_collection_notes']));

    if (studyJson['so:url'] !== undefined && studyJson['so:url'] !== null) {
        AddTableRow (htmlarray, "More info", '<a href="' + studyJson['so:url'] + '" target="_blank" style="newstyle_link">link</a>');
    }

    if (studyJson['so:contentUrl'] !== undefined) {
        AddTableRow (htmlarray, 'Download frictionless data package', '<a href="' + studyJson['so:contentUrl'] + '" target="_blank" style="newstyle_link">Frictionless data</a>');
    }

    if (studyJson["handbook"] !== undefined) {
        let handbook = '<a target="_blank" style="newstyle_link" href="' +  studyJson['handbook']['so:url']   + '" target="_blank">' + studyJson['handbook']['name'] + '</a>';

        AddTableRow (htmlarray, "Handbook pdf", handbook); 
    }

    if (check_plots(studyJson)){
        let CSV_link = '<a target="_blank" style="newstyle_link" href="' + root_dir + 'download/' + studyID + '" target="_blank">' +"Plot data of "+ studyJson['parent_field_trial']['so:name'] + '</a>';
        AddTableRow(htmlarray, "CSV file ", CSV_link);
    }

    htmlarray.push('</tbody>');
    htmlarray.push('</table>');

    htmlarray.push('<hr/>');
    return htmlarray.join("");

}


/**
 * Add a table row to a given html variable */
function AddTableRow (table_var, key, value) {
    table_var.push('<tr>\n<td><strong>');
    table_var.push(key);
    table_var.push(':</strong>\n</td>\n<td>');
    table_var.push(value);
    table_var.push('</td>\n</tr>\n');

}

/**
 * Remove all markers and geoJSON on the map
 *
 */
function removePointers() {
    map.removeLayer(markersGroup2);
    markersGroup2 = new L.MarkerClusterGroup();
}


/**
 * Display all field trials on the map
 *
 * @param {JSONArray} array - JSONArray from backend containing all field tria (with locations) info.
 * @param {string} type_param - type of the display, can be Grassroots:FieldTrial, Grassroots:Study or AllFieldTrials.
 */
function displayFTLocations(array, type_param) {
    for (i = 0; i < array.length; i++) {
        var la = '';
        var lo = '';
        var country = '';
        var town = '';
        var name = '';

        var fieldTrialName = array[i]['so:name'];
        var team = array[i]['team'];

        var sowing_date = (array[i]['sowing_date'] != undefined) ? array[i]['sowing_date'] : " ";
        var harvest_date = (array[i]['harvest_date'] != undefined) ? array[i]['harvest_date'] : " ";


        la = array[i]['address']['address']['location']['centre']['latitude'];
        lo = array[i]['address']['address']['location']['centre']['longitude'];

        if (array[i]['address']['address']['Address'] != undefined) {
            if (array[i]['address']['address']['Address']['addressCountry'] != undefined) {
                country = array[i]['address']['address']['Address']['addressCountry'];
            }
            if (array[i]['address']['address']['Address']['addressLocality'] != undefined) {
                town = array[i]['address']['address']['Address']['addressLocality'];
            }
            if (array[i]['address']['name'] != undefined) {
                name = array[i]['address']['name'];
            }
        }
        var id = array[i]['_id']['$oid'];
        /* remove the quotes */
        id = id.replace(/"/g, "");
        // var popup_note = '<b>Field Trial Name: </b>' + fieldTrialName + '<br/>'
        //     + '<b>Team: </b>' + team + '<br/>'
        //     + '<b>Sowing Date: </b>' + sowing_date + '<br/>'
        //     + '<b>Harvest Date: </b>' + harvest_date + '<br/>'
        //     // + '<u class=\"newstyle_link\" onclick="plot_colorbox(\'' + id + '\');" style="cursor: pointer;">View plots</u>'
        //     + '<a class=\"newstyle_link\" href=\"../dynamic/fieldtrialplots_dynamic.html?id=' + id + '\" target="_blank">View plots</a>'
        // ;
        // table with two columns same as single study detail page
        var popup_note = create_study_info_html(array[i])
        addFTPointer(la, lo, popup_note);

        // shape data with popup info
        if (type_param === 'Grassroots:Study') {
            if (array[i]['shape_data'] !== null && array[i]['shape_data'] !== undefined && array[i]['shape_data'] !== '') {
                //geo_json contains the GPS data. It is used by Leaflet to draw the shape
                // onEachFeature block is part of Leaflet 
                let geo_json = array[i]['shape_data'];
                var shape_layer = L.geoJson(geo_json);
                markersGroup2.addLayer(shape_layer);
                var layerGroup = L.geoJson(geo_json, {
                    onEachFeature: function (feature, layer) {
                        // Consider plot_id and Plot ID, as some studies have plot_id and some Plot_ID!!
                        var plotId = feature.properties['plot_id'] || feature.properties['Plot ID'];
                        var popupContent = 'Study: ' + SafePrint(geo_json['name']) + '<br/>Plot ID: ' + SafePrint(feature.properties['plot_id'] || feature.properties['Plot ID']);
                        if (type_param_global === 'Grassroots:Study' && plotsModalInfo[plotId] !== undefined) {
                           //var popupContent = plotsModalInfo[plotId];
			                var popupContent = plotsInfoGPS[plotId]; //Correction for incomplete table over maps
                        }
                        layer.bindPopup(popupContent, {maxWidth: 800, maxHeight: 400});
                        // layer.bindPopup('<p>Plot No.:</p>');
                    }
                });
                markersGroup2.addLayer(layerGroup);
            }
        }
    }
    map.addLayer(markersGroup2);


}

/**
 * Display colorbox of a given plot
 *
 * @param {string} id - id of the plot.
 */
// deprecated
// function plot_colorbox(id) {
//     var plot_data = plotsHTMLArray[id];
//
//     // $('#modal-body').html(plot_data);
//     $.colorbox({width: "80%", html: plot_data});
//     // $('#plotModal').modal('show');
// }


/**
 * Add a pointer to the map
 *
 * @param {string} la - latitude of the pointer.
 * @param {string} lo - longitude of the pointer.
 * @param {string} note - popup notes of the pointer.
 */
function addFTPointer(la, lo, note) {
    var blueIcon = new L.Icon({
        iconUrl: 'scripts/leaflet/images/marker-icon-2x-blue.png',
        shadowUrl: 'scripts/leaflet/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });

    var redIcon = new L.Icon({
        iconUrl: 'scripts/leaflet/images/marker-icon-2x-red.png',
        shadowUrl: 'scripts/leaflet/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });

    var greenIcon = new L.Icon({
        iconUrl: 'scripts/leaflet/images/marker-icon-2x-green.png',
        shadowUrl: 'scripts/leaflet/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });

    var orangeIcon = new L.Icon({
        iconUrl: 'scripts/leaflet/images/marker-icon-2x-orange.png',
        shadowUrl: 'scripts/leaflet/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });

    var yellowIcon = new L.Icon({
        iconUrl: 'scripts/leaflet/images/marker-icon-2x-yellow.png',
        shadowUrl: 'scripts/leaflet/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });

    var violetIcon = new L.Icon({
        iconUrl: 'scripts/leaflet/images/marker-icon-2x-violet.png',
        shadowUrl: 'scripts/leaflet/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });

    var greyIcon = new L.Icon({
        iconUrl: 'scripts/leaflet/images/marker-icon-2x-grey.png',
        shadowUrl: 'scripts/leaflet/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });

    var blackIcon = new L.Icon({
        iconUrl: 'scripts/leaflet/images/marker-icon-2x-black.png',
        shadowUrl: 'scripts/leaflet/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });
    var markerLayer;
    var popup = L.popup({maxHeight: 400}).setContent(note);
    markerLayer = L.marker([la, lo]).bindPopup(popup).openPopup();
    markersGroup2.addLayer(markerLayer);

}

/**
 * Format a given plot and stored in the plotsModalInfo global var
 *
 * @param {JSON} plot - JSON of the give plot.
 * @param {string} plot_block_rows - number of rows in block.
 * @param {string} plot_block_columns - number of columns in block.
 */
function formatPlot(plot, plot_block_rows, plot_block_columns) {
  // console.log(JSON.stringify(plot));
    let plotId = plot['_id']['$oid'];
    let current_row = parseInt(plot['row_index']);
    let current_column = parseInt(plot['column_index']);
    let accession = "";
    //for (r = 0; r < plot['rows'].length; r++) {
    //    accession += " " + plot['rows'][r]['material']['accession'];  //Check for discarded ones!
    //}

	for (r = 0; r < plot['rows'].length; r++)  //  
  	{
	  if (plot ['rows'][r]['discard'])
  	  {
	    // it's a discard plot
    		accession += 'discard';
  	   }
	  else if (plot ['rows'][r]['blank'])
  	  {
    		// it's a blank plot
   	  }
   	  else if (plot['rows'][r]['material'])
  	  {
    		accession += " " + plot['rows'][r]['material']['accession'];
  	  }
	}


    var color;
    color = '#ABEBC6';

    plotsModalInfo[plotId] = formatPlotModal(plot);
    let padding = plot_gap_calculator(current_column, current_row, plot_block_columns, plot_block_rows);
    return '<td style="' + padding + '"><div class="plot" id="' + plotId + '" style="padding:5px; cursor:pointer; font-size: 0.8rem;  background-color:' + color + '" onclick="plotModal(\'' + plotId + '\')">Row:' + current_row + ' Column:' + current_column + '</div></td>';
}

/**
 * Calculate gaps in the plot view
 *
 * @param {string} current_column - current number of column.
 * @param {string} current_row - current number of row.
 * @param {string} plot_block_rows - number of rows in block.
 * @param {string} plot_block_columns - number of columns in block.
 */
function plot_gap_calculator(current_column, current_row, plot_block_columns, plot_block_rows) {
    let padding = 'padding:5px;';
    if (current_column % plot_block_columns === 0 && current_row % plot_block_rows === 0) {
        console.log('both');
        padding = 'padding:30px 30px 5px 5px;';
    } else if (current_column % plot_block_columns === 0) {
        console.log('ver');
        padding = 'padding:5px 30px 5px 5px;';
    } else if (current_row % plot_block_rows === 0) {
        console.log('hori');
        padding = 'padding:30px 5px 5px 5px;';
    }
    return padding;
}


/**
 * Display plot modal with a given id
 *
 * @param {string} plotId - Plot id.
 */
function plotModal(plotId) {
   $('#modal-body').html(plotsModalInfo[plotId]);
   $('#plotModal').modal('show');

     console.log ("-Treatment_factors: " + plotId);
     //console.log (plotsModalInfo[plotId]);
    
    let searchStr = '';
    let searchTreat       = ''; // NEW
    let replicateIds      = []; // NEW
    let replicates        = {}; // NEW
    let current_treatment = []; // NEW



    for (i = 0; i < plot_json.length; i++) {
        if (plot_json[i]['_id']['$oid'] === plotId) {
            var plot = plot_json[i];
            for (r = 0; r < plot['rows'].length; r++) {
                //let this_accession = SafePrint(plot['rows'][r]['material']['accession']); Check for discarded ones!
		 if (plot ['rows'][r]['discard'])
  	    	 { 
			  // it's a discard plot
                	 searchStr = 'discard';
  	   	 }
		 else if (plot ['rows'][r]['blank'])
  	  	  {
	    		// it's a blank plot
   		  }
	  	 else if (plot['rows'][r]['material'])
  	         {
                	let this_accession = SafePrint(plot['rows'][r]['material']['accession']);
                        get_GRU_by_accession(this_accession, plotId, r);
                        searchStr = this_accession;

                        if (plot['rows'][r]['treatments']){

                                let this_treatment = SafePrint(plot['rows'][r]['treatments'][0]['label']);//treatment info of current plot
                                searchTreat = this_treatment;
                                treatment = true
                                for (t = 0; t < plot['rows'][r]['treatments'].length; t++) {
                                 current_treatment.push(plot['rows'][r]['treatments'][t]['label']);
                                }
                        }
                        else{
                                console.log("study with no treatments")
                                treatment = false
                        }
  	         }
            }
        }
    }
    
    var foundReplicates=false
    for (j = 0; j < plot_json.length; j++) {
        const loop_plotId = plot_json[j]['_id']['$oid'];
        if (loop_plotId !== plotId) {
            var rows = plot_json[j]['rows'];
    	    let treatments = []; // NEW

	    for (jr = 0; jr < rows.length; jr++) {
                	//var accession = rows[jr]['material']['accession'];  // add check for discarded ones.
			 if (rows[jr]['discard'])
		  	  {
			        // it's a discard plot
                	        var accession = 'discard';
		  	  }
			  else if ( rows[jr]['blank'])
  	  		  {
		    		// it's a blank plot
   	  		  }
		   	  else if (rows[jr]['material'])
  	  		  {
                	        var accession = rows[jr]['material']['accession'];
				if (treatment==true){
			        	for (t = 0; t < rows[jr]['treatments'].length; t++) {
			 	 		treatments.push( rows[jr]['treatments'][t]['label'] );
					}
			        }

  	  		  }

                if (accession != undefined) {
                    if (searchStr === accession && searchStr !== '') {
                        let formatted_plot = format_plot_rows(plot_json[j], true);
			foundReplicates=true

			if (areEqual(current_treatment, treatments)  && searchTreat !== '') {// new EXACT REPLICATES (same treatment)
                              console.log("ID of exact replicate", plot_json[j]['rows'][0]['study_index']  );
                              replicateIds.push(loop_plotId);
                              replicates[loop_plotId] = plot_json[j]['rows'];

                              var formatted_phenotypes = format_plot_rows(plot_json[j], true);
                              //$('#phenotypes').append(formatted_phenotypes['phenotypes'].join(""));   // add only exact replicates
                        }
			 else if (treatment==false) {   // Found replicates but study has no treatments
                              console.log("ID  replicate (no treatments)", plot_json[j]['rows'][0]['study_index']  );
                              replicateIds.push(loop_plotId);
                              replicates[loop_plotId] = plot_json[j]['rows'];

                              var formatted_phenotypes = format_plot_rows(plot_json[j], true);
                        }


                        $('#rowsInfo').append(formatted_plot['rowsInfo'].join(""));
                        //$('#phenotypes').append(formatted_plot['phenotypes'].join("")); momentary
                        break;
                    }
                }
            }
        }

    } // end of loop through all plots to find replicates.

    if( searchStr !== 'discard' && foundReplicates==true && replicateIds.length > 0 ){
	 //  NEW FUCTION to format phenotypes independently  after finding exact replicates.
        let formatted_pheno = format_pheno(plot, replicateIds, replicates, foundReplicates);

        // console.log ("new phenotype array", formatted_pheno['phenotypes']);
	//$('#phenotypes').append(formatted_phenotypes['phenotypes'].join("")); // 
	$('#phenotypes').append(formatted_pheno['phenotypes'].join("")); // Add phenotypes data of replicates once searching loop is completed
    }

   if (foundReplicates==false || replicateIds.length == 0){
	foundReplicates=false // set it true as no exact replicates were found
        let formatted_pheno = format_pheno(plot, replicateIds, replicates, foundReplicates); //Add phenotypes data of the current plot only.
        $('#phenotypes').append(formatted_pheno['phenotypes'].join("")); 
    }


    $('#plots_table').DataTable({
        "aaSorting": [],
        "lengthMenu": [[100, 500, -1], [100, 500, "All"]]
    });
    $('#plots_table_rows').DataTable({
        "aaSorting": [],
        "lengthMenu": [[100, 500, -1], [100, 500, "All"]]
    });
    simpleOrAdvanced_pheno('show_simple');
    simpleOrAdvanced_rows('show_simple');

}

/*
 * @param {JSON} plot - Plot JSON.  // NEW function variations of original formatPlotModal
 */
function formatGPSPlot(plot, study_design) {

    let htmlarray = [];
    let phenotypearray = [];
    let rowsInfoarray = [];

    let plot_actual_id = '';

    
   if (plot['rows'][0]['study_index'] !== undefined) {
        plot_actual_id = plot['rows'][0]['study_index'];
    }

    rowsInfoarray.push('<table class="table racks" id="plots_table_rows"><thead><tr><th>Replicate</th><th>Rack</th><th>Accession</th><th>Pedigree</th><th>Links</th><th>Treatments</th></tr></thead><tbody id="rowsInfo">'); // remove Gene Bank temporarily
    
   //phenotypearray.push('<table class="table plots" id="plots_table"><thead><tr><th>Replicate</th><th>Rack</th><th>Date</th><th>Raw Value</th><th>Corrected Value</th><th>Raw Value Replicate</th><th>Raw Value Replicate</th><th>Trait</th><th>Measurement</th><th>Unit</th><th>Index</th></tr></thead><tbody id="phenotypes">');// Restore corrected Value 
    phenotypearray.push('<table class="table plots" id="plots_table"><thead><tr><th>Replicate</th><th>Rack</th><th>Date</th><th>Raw Value</th><th>Corrected Value</th><th>Trait</th><th>Measurement</th><th>Unit</th><th>Index</th><th>Notes</th></tr></thead><tbody id="phenotypes">');  // OLD STRUCTURE


    let formatted_plot = format_plot_rows(plot, false);
    
    console.log(" GPS Check 2: Add phenotypes");
    rowsInfoarray  = rowsInfoarray.concat(formatted_plot['rowsInfo']);
    phenotypearray = phenotypearray.concat(formatted_plot['phenotypes']); // restore for this case

   
    rowsInfoarray.push('</tbody></table>');
    phenotypearray.push('</tbody></table>');
    htmlarray.push('<div class="row justify-content-between">');
    htmlarray.push('<div class="col-4">');
    htmlarray.push('Plot ID: ' + plot_actual_id + '<br/>');
    htmlarray.push('Row: ' + plot['row_index'] + '<br/>');
    htmlarray.push('Column: ' + plot['column_index'] + '<br/>');
    htmlarray.push('Length: ' + SafePrint_with_value(plot['length'], default_length) + 'm<br/>');
    htmlarray.push('Width: ' + SafePrint_with_value(plot['width'], default_width) + 'm<br/>'); 
    //htmlarray.push('Study Design: ' + SafePrint_with_value(plot['study_design'], default_design) + '<br/>');
    htmlarray.push('Study Design: ' + SafePrint_with_value(study_design, default_design) + '<br/>');
    htmlarray.push('Sowing Date: ' + SafePrint_with_value(plot['sowing_date'], default_sowing_date) + '<br/>');
    htmlarray.push('Harvest Date: ' + SafePrint_with_value(plot['harvest_date'], default_harvest_date) + '<br/>');
    htmlarray.push('Sowing Order: ' + SafePrint(plot['sowing_order']) + '<br/>');
    htmlarray.push('Walking Order: ' + SafePrint(plot['walking_order']) + '<br/>');
    // htmlarray.push('Treatment: ' + SafePrint(plot['treatment']) + '<br/>');
    htmlarray.push('Comment: ' + SafePrint(plot['comment']) + '<br/>');
    htmlarray.push('</div>');

    
    // Initialize image array
    combinedImages = [];
    if (plot['so:image'] && plot['so:image']['thumbnail']) {
        if (Array.isArray(plot['so:image']['thumbnail']) && Array.isArray(plot['so:image']['contentUrl'])) {
            plot['so:image']['thumbnail'].forEach((thumb, index) => {
                combinedImages.push({
                    thumbnail: thumb,
                    contentUrl: plot['so:image']['contentUrl'][index] || thumb // Fallback to thumbnail if contentUrl isn't defined
                });
            });
        } else {
            combinedImages.push({
                thumbnail: plot['so:image']['thumbnail'],
                contentUrl: plot['so:image']['contentUrl'] || plot['so:image']['thumbnail']
            });
        }
    }
    
    // Filter and append other images from the global images array
    let plotSpecificImages = images.filter(img => {
        return img.includes(`/plot_${plot_actual_id}/`) && !img.includes('thumb');
    });
    console.log("Plot specific images: " + plotSpecificImages);
    plotSpecificImages.forEach(img => {
        combinedImages.push({
            thumbnail: img,
            contentUrl: img  // Assuming img URL is appropriate for both thumbnail and high-res
        });
    });
    console.log("Combined images" + combinedImages);
    if(combinedImages.length > 0) {
        htmlarray.push('<div class="col-8" style="position: relative; overflow: hidden;">');
        htmlarray.push('<div class="image-carousel">');
        htmlarray.push('<button class="carousel-button" style="position: absolute; left: 0;" onclick="changeImage(-1)">&#10094;</button>'); // Left arrow
        combinedImages.forEach((image, index) => {
            const dateTitle = formatDateFromFilename(image.thumbnail);
            htmlarray.push(`<div class="image-container" style="display: ${index === 0 ? 'block' : 'none'};">`);
            htmlarray.push(`<div class="image-title">${dateTitle}</div>`); // Date above the image
            htmlarray.push(`<a href="${image.contentUrl}" target="_blank"><img class="carouselImage" src="${image.thumbnail}" height="300" onerror="this.onerror=null; this.src='fallback.jpg';"/></a>`);
            htmlarray.push(`</div>`); // Close image-container div
        });
        htmlarray.push('<button class="carousel-button" style="position: absolute; right: 0;" onclick="changeImage(1)">&#10095;</button>'); // Right arrow
        htmlarray.push('</div>'); // Close carousel div
        htmlarray.push('</div>'); // Close image column div
    }

    htmlarray.push('</div>'); // Close row div

    htmlarray.push(s_formatted_treatments);
    htmlarray.push('<hr/>');
    htmlarray.push('<h5>Rows:</h5>');
    htmlarray.push('        <div id="simpleAdvanceWrapper1" style="display:none;" >\n' +
        '            <label class="radio-inline" style="margin-right: 20px;"><input type="radio" name="simpleadvancedrows"\n' +
        '                                                                           value="show_simple"\n' +
        '                                                                           onclick="simpleOrAdvanced_rows(this.value)"\n' +
        '                                                                           checked>\n' +
        '                Simple view </label>\n' +
        '            <label class="radio-inline"><input type="radio" name="simpleadvancedrows" value="show_advanced"\n' +
        '                                               onclick="simpleOrAdvanced_rows(this.value)"> Advanced view</label>\n' +
        '        </div>');
    htmlarray.push(rowsInfoarray.join(""));
    htmlarray.push('<hr/>');
    htmlarray.push('<h5>Phenotypes</h5>');
    htmlarray.push('        <div id="simpleAdvanceWrapper2" style="display:none;"  >\n' +
        '            <label class="radio-inline" style="margin-right: 20px;"><input type="radio" name="simpleadvanced"\n' +
        '                                                                           value="show_simple"\n' +
        '                                                                           onclick="simpleOrAdvanced_pheno(this.value)"\n' +
        '                                                                           checked>\n' +
        '                Simple view </label>\n' +
        '            <label class="radio-inline"><input type="radio" name="simpleadvanced" value="show_advanced"\n' +
        '                                               onclick="simpleOrAdvanced_pheno(this.value)"> Advanced view</label>\n' +
        '        </div>');
    htmlarray.push(phenotypearray.join(""));

    return htmlarray.join("");


}





/**
 * Format plot modal in html
 *
 * @param {JSON} plot - Plot JSON.
 */
function formatPlotModal(plot) {

    let htmlarray = [];
    let phenotypearray = [];
    let rowsInfoarray = [];

    let plot_actual_id = '';

    
   if (plot['rows'][0]['study_index'] !== undefined) {
        plot_actual_id = plot['rows'][0]['study_index'];
    }

    //rowsInfoarray.push('<table class="table racks" id="plots_table_rows"><thead><tr><th>Replicate</th><th>Rack</th><th>Accession</th><th>Pedigree</th><th>Gene Bank</th><th>Links</th><th>Treatments</th></tr></thead><tbody id="rowsInfo">');
    rowsInfoarray.push('<table class="table racks" id="plots_table_rows"><thead><tr><th>Replicate</th><th>Rack</th><th>Accession</th><th>Pedigree</th><th>Links</th><th>Treatments</th></tr></thead><tbody id="rowsInfo">'); // remove Gene Bank temporarily
    
   //phenotypearray.push('<table class="table plots" id="plots_table"><thead><tr><th>Replicate</th><th>Rack</th><th>Date</th><th>Raw Value</th><th>Corrected Value</th><th>Trait</th><th>Measurement</th><th>Unit</th><th>Index</th></tr></thead><tbody id="phenotypes">'); //original  9 columns
   //phenotypearray.push('<table class="table plots" id="plots_table"><thead><tr><th>Replicate</th><th>Rack</th><th>Date</th><th>Raw Value</th><th>Raw Value Replicate</th><th>Trait</th><th>Measurement</th><th>Unit</th><th>Index</th></tr></thead><tbody id="phenotypes">');  // TEST 9 columns  extra raw value
   phenotypearray.push('<table class="table plots" id="plots_table"><thead><tr><th>Replicate</th><th>Rack</th><th>Date</th><th>Raw Value</th><th>Corrected Value</th><th>Raw Value Replicate</th><th>Raw Value Replicate</th><th>Trait</th><th>Measurement</th><th>Unit</th><th>Index</th><th>Comment</th></tr></thead><tbody id="phenotypes">');// Restore corrected Value 

    let formatted_plot = format_plot_rows(plot, false);

    rowsInfoarray = rowsInfoarray.concat(formatted_plot['rowsInfo']);     

    rowsInfoarray.push('</tbody></table>');
    phenotypearray.push('</tbody></table>');
    htmlarray.push('<div class="row justify-content-between">');
    htmlarray.push('<div class="col-4">');
    htmlarray.push('Plot ID: ' + plot_actual_id + '<br/>');
    htmlarray.push('Row: ' + plot['row_index'] + '<br/>');
    htmlarray.push('Column: ' + plot['column_index'] + '<br/>');
    htmlarray.push('Length: ' + SafePrint_with_value(plot['length'], default_length) + 'm<br/>');
    htmlarray.push('Width: ' + SafePrint_with_value(plot['width'], default_width) + 'm<br/>');
    htmlarray.push('Study Design: ' + SafePrint_with_value(plot['study_design'], default_design) + '<br/>');
    htmlarray.push('Sowing Date: ' + SafePrint_with_value(plot['sowing_date'], default_sowing_date) + '<br/>');
    htmlarray.push('Harvest Date: ' + SafePrint_with_value(plot['harvest_date'], default_harvest_date) + '<br/>');
    htmlarray.push('Sowing Order: ' + SafePrint(plot['sowing_order']) + '<br/>');
    htmlarray.push('Walking Order: ' + SafePrint(plot['walking_order']) + '<br/>');
    // htmlarray.push('Treatment: ' + SafePrint(plot['treatment']) + '<br/>');
    htmlarray.push('Comment: ' + SafePrint(plot['comment']) + '<br/>');
    htmlarray.push('</div>');

    //console.log(" CHECK 3 FORMAT PLOT MODAL");
        // Initialize image array
    combinedImages = [];
    if (plot['so:image'] && plot['so:image']['thumbnail']) {
        if (Array.isArray(plot['so:image']['thumbnail']) && Array.isArray(plot['so:image']['contentUrl'])) {
            plot['so:image']['thumbnail'].forEach((thumb, index) => {
                combinedImages.push({
                    thumbnail: thumb,
                    contentUrl: plot['so:image']['contentUrl'][index] || thumb // Fallback to thumbnail if contentUrl isn't defined
                });
            });
        } else {
            combinedImages.push({
                thumbnail: plot['so:image']['thumbnail'],
                contentUrl: plot['so:image']['contentUrl'] || plot['so:image']['thumbnail']
            });
        }
    }
    
    // Filter and append other images from the global images array
    let plotSpecificImages = images.filter(img => {
        return img.includes(`/plot_${plot_actual_id}/`) && !img.includes('thumb');
    });
    console.log("Plot specific images: " + plotSpecificImages);
    plotSpecificImages.forEach(img => {
        combinedImages.push({
            thumbnail: img,
            contentUrl: img  // Assuming img URL is appropriate for both thumbnail and high-res
        });
    });
    console.log("Combined images" + combinedImages);
    if(combinedImages.length > 0) {
        htmlarray.push('<div class="col-8" style="position: relative; overflow: hidden;">');
        htmlarray.push('<div class="image-carousel">');
        htmlarray.push('<button class="carousel-button" style="position: absolute; left: 0;" onclick="changeImage(-1)">&#10094;</button>'); // Left arrow
        combinedImages.forEach((image, index) => {
            const dateTitle = formatDateFromFilename(image.thumbnail);
            htmlarray.push(`<div class="image-container" style="display: ${index === 0 ? 'block' : 'none'};">`);
            htmlarray.push(`<div class="image-title">${dateTitle}</div>`); // Date above the image
            htmlarray.push(`<a href="${image.contentUrl}" target="_blank"><img class="carouselImage" src="${image.thumbnail}" height="300" onerror="this.onerror=null; this.src='fallback.jpg';"/></a>`);
            htmlarray.push(`</div>`); // Close image-container div
        });
        htmlarray.push('<button class="carousel-button" style="position: absolute; right: 0;" onclick="changeImage(1)">&#10095;</button>'); // Right arrow
        htmlarray.push('</div>'); // Close carousel div
        htmlarray.push('</div>'); // Close image column div
    }

    htmlarray.push('</div>'); // Close row div


    htmlarray.push(s_formatted_treatments);
    htmlarray.push('<hr/>');
    htmlarray.push('<h5>Rows:</h5>');
    htmlarray.push('        <div id="simpleAdvanceWrapper1" style="display:none;" >\n' +
        '            <label class="radio-inline" style="margin-right: 20px;"><input type="radio" name="simpleadvancedrows"\n' +
        '                                                                           value="show_simple"\n' +
        '                                                                           onclick="simpleOrAdvanced_rows(this.value)"\n' +
        '                                                                           checked>\n' +
        '                Simple view </label>\n' +
        '            <label class="radio-inline"><input type="radio" name="simpleadvancedrows" value="show_advanced"\n' +
        '                                               onclick="simpleOrAdvanced_rows(this.value)"> Advanced view</label>\n' +
        '        </div>');
    htmlarray.push(rowsInfoarray.join(""));
    htmlarray.push('<hr/>');
    htmlarray.push('<h5>Phenotypes</h5>');
    htmlarray.push('        <div id="simpleAdvanceWrapper2" style="display:none;"  >\n' +
        '            <label class="radio-inline" style="margin-right: 20px;"><input type="radio" name="simpleadvanced"\n' +
        '                                                                           value="show_simple"\n' +
        '                                                                           onclick="simpleOrAdvanced_pheno(this.value)"\n' +
        '                                                                           checked>\n' +
        '                Simple view </label>\n' +
        '            <label class="radio-inline"><input type="radio" name="simpleadvanced" value="show_advanced"\n' +
        '                                               onclick="simpleOrAdvanced_pheno(this.value)"> Advanced view</label>\n' +
        '        </div>');
    htmlarray.push(phenotypearray.join(""));

    return htmlarray.join("");


}

/**
 * Format plot rows
 *
 * @param {JSON} plot - Plot JSON.
 * @param {Boolean} replicate_bool - Boolean if it is a replicate.
 * used to create the modal window in the study page for each plot over the map
 */
function format_plot_rows(plot, replicate_bool) {
    let plotId = plot['_id']['$oid'];

    let plot_actual_id = '';

    if (plot['rows'][0]['study_index'] !== undefined) {
        plot_actual_id = plot['rows'][0]['study_index'];
    }
    let formatted_plot = {};
    let phenotypearray = [];
    let rowsInfoarray = [];
    
    let replicate = ' (Plot ' + plot_actual_id + ' Row:' + plot['row_index'] + ' - Col:' + plot['column_index'] + ')(Current)';
    if (replicate_bool) {
        replicate = ' <u style="cursor:pointer;" onclick="plotModal(\'' + plotId + '\')">(Plot ' + plot_actual_id + ' Row:' + plot['row_index'] + ' - Col:' + plot['column_index'] + ')</u>';
    }

    for (r = 0; r < plot['rows'].length; r++) {
        var replicate_index = plot['rows'][r]['replicate'];
        var color = colorJSON[replicate_index];
        //var accession = SafePrint(plot['rows'][r]['material']['accession']);//  Add check for discarded ones. 
        //var pedigree = SafePrint(plot['rows'][r]['material']['pedigree']); 
	if (plot ['rows'][r]['discard']) {
	        //  it's a discard plot
		var accession = 'discard';
        	var color = colorJSON[2]; // Select random colour. 

  	}
        else if (plot ['rows'][r]['blank']){
    		// it's a blank plot
   	 }
   	 else if (plot['rows'][r]['material']){
               var accession = SafePrint(plot['rows'][r]['material']['accession']);
               var pedigree =  SafePrint(plot['rows'][r]['material']['pedigree']);
  	 }
        var treatments = plot['rows'][r]['treatments'];
        
	rowsInfoarray.push('<tr>');
        rowsInfoarray.push('<td style="background-color:' + color + '">' + SafePrint(replicate_index) + replicate + '</td>');
        rowsInfoarray.push('<td>' + SafePrint(plot['rows'][r]['rack_index']) + '</td>');
        rowsInfoarray.push('<td>' + accession + '</td>');
        rowsInfoarray.push('<td>' + pedigree + '</td>');
        //rowsInfoarray.push('<td><a class="newstyle_link" target="_blank" href="' + SafePrint(plot['rows'][r]['material']['gene_bank']['so:url']) + '">' + SafePrint(plot['rows'][r]['material']['gene_bank']['so:name']) + '</a></td>');//     GENE BANK
	if (plot ['rows'][r]['discard']) {
	    // it's a discard plot
  	}
	else if (plot ['rows'][r]['blank']){
    	    // it's a blank plot
   	}
   	else if (plot['rows'][r]['material']){
             //    rowsInfoarray.push('<td><a class="newstyle_link" target="_blank" href="' + SafePrint(plot['rows'][r]['material']['gene_bank']['so:url']) + '">' + SafePrint(plot['rows'][r]['material']['gene_bank']['so:name']) + '</a></td>'); // GENE BANK
  	}

        rowsInfoarray.push('<td id="' + plotId + '_' + r + '"></td>');

        if (treatments !== null && treatments !== [] && treatments !== undefined) {
            rowsInfoarray.push('<td>' + format_plot_treatment(treatments) + '</td>');
        } else {
            rowsInfoarray.push('<td></td>');
        }
        rowsInfoarray.push('</tr>');

        if (plot['rows'][r]['observations'] != undefined) {
            let crop_onotology_url = "https://cropontology.org/term/"
   	
            for (o = 0; o < plot['rows'][r]['observations'].length; o++) {
                var observation = plot['rows'][r]['observations'][o];
                var phenotype_name = observation['phenotype']['variable'];// from new arrangement of JSON structure.

                phenotypearray.push('<tr>');
                phenotypearray.push('<td style="background-color:' + color + '">' + SafePrint(replicate_index) + replicate + '</td>');
                
		        phenotypearray.push('<td>' + SafePrint(plot['rows'][r]['rack_index']) + '</td>');
                // Ensure correct pairing of date, raw value, and corrected value
            let observationDate = observation['date'] ? observation['date'].split('T')[0] : 'N/A';
            let rawValue = round2Fixed(SafePrint(observation['raw_value']));
            let correctedValue = SafePrint(observation['corrected_value']);

            // Add the date, raw value, and corrected value to the table
            phenotypearray.push('<td>' + observationDate + '</td>');
            phenotypearray.push('<td>' + rawValue + '</td>');
            phenotypearray.push('<td>' + correctedValue + '</td>');

            if (lookup( phenotype_name,  'trait', 'so:sameAs').startsWith('CO')) {
                    phenotypearray.push('<td class="tooltip-test"  title="' + lookup(phenotype_name, 'trait','so:description') + '"><a class="newstyle_link" target="_blank" href="' + crop_onotology_url + lookup(phenotype_name, 'trait','so:sameAs') + '">' + lookup(phenotype_name, 'trait','so:name') + '</a></td>');

            } else {
                    phenotypearray.push('<td class="tooltip-test"  title="' + lookup(phenotype_name, 'trait','so:description')  + '">' + lookup(phenotype_name, 'trait','so:name')  + '</td>');
            }
                
		    if (lookup( phenotype_name,  'measurement', 'so:sameAs').startsWith('CO')) {
                    phenotypearray.push('<td data-toggle="tooltip" title="' + lookup( phenotype_name,  'measurement', 'so:description') + '"><a class="newstyle_link" target="_blank" href="' + crop_onotology_url + lookup( phenotype_name,  'measurement', 'so:sameAs')  + '">' + lookup( phenotype_name,  'measurement', 'so:name') + '</td>');

            } else {
                    phenotypearray.push('<td data-toggle="tooltip" title="' + lookup(phenotype_name,  'measurement', 'so:description') + '">' + lookup(phenotype_name,  'measurement', 'so:name') + '</td>');
                }
                
		    if (lookup( phenotype_name,  'unit', 'so:sameAs')) {
                    phenotypearray.push('<td data-toggle="tooltip"><a class="newstyle_link" target="_blank" href="' + crop_onotology_url + lookup(phenotype_name,  'unit', 'so:sameAs') + '">' + lookup(phenotype_name,  'unit', 'so:name')  + '</td>');

            } else {
                    phenotypearray.push('<td>' +  lookup(phenotype_name,  'unit', 'so:name')  + '</td>');
            }

                phenotypearray.push('<td>' + SafePrint(observation['index']) + '</td>');

                phenotypearray.push('<td>' + SafePrint(observation['notes']) + '</td>');

                phenotypearray.push('</tr>');
            }
        } // end if

        // plotsGRUArray[plotId] = plotGRULinkArray;
	    //
    } // end main r loop

    
    formatted_plot['rowsInfo'] = rowsInfoarray;
    formatted_plot['phenotypes'] = phenotypearray;

    return formatted_plot;
}

/**
 * Set show simple or advanced parameters for plots phenotype table
 *
 * @param {string} string - show_simple or show_advanced.
 */
function simpleOrAdvanced_pheno(string) {
    $('#simpleAdvanceWrapper1').show();
    var pheno_table = $('#plots_table').DataTable();
    if (string === 'show_simple') {
        pheno_table.column(1).visible(false);
        pheno_table.column(2).visible(true); // date
        pheno_table.column(3).visible(true); // raw value current plot
        pheno_table.column(4).visible(false);// corrected value
        pheno_table.column(5).visible(true); // Replicate 1
        pheno_table.column(6).visible(true);//  Replicate 2
        pheno_table.column(7).visible(true);// TRAIT
        pheno_table.column(8).visible(false);
        pheno_table.column(9).visible(true);// Index 
    } else if (string === 'show_advanced') {
        pheno_table.column(1).visible(true);// rack
        pheno_table.column(2).visible(true);// date
        pheno_table.column(3).visible(true);
        pheno_table.column(4).visible(true);
        pheno_table.column(5).visible(true); 
        pheno_table.column(6).visible(true); 
        pheno_table.column(7).visible(true);// Trait
        pheno_table.column(8).visible(true);// Measurement
        pheno_table.column(9).visible(true);// Unit
        pheno_table.column(9).visible(false);// Index
    }

}

/**
 * Set show simple or advanced parameters for plots rows table
 *
 * @param {string} string - show_simple or show_advanced.
 */
function simpleOrAdvanced_rows(string) {
    $('#simpleAdvanceWrapper2').show();
    var pheno_table = $('#plots_table_rows').DataTable();
    if (string === 'show_simple') {
        pheno_table.column(1).visible(false);
        pheno_table.column(4).visible(true); //GENE BANK
    } else if (string === 'show_advanced') {
        pheno_table.column(1).visible(true);
        pheno_table.column(4).visible(true);
    }

}


/**
 * Format treatments
 *
 * @param {JSONArray} treatments - Treatment JSONArray.
 */
function format_plot_treatment(treatments) {
    let htmlarray = [];
    for (i = 0; i < treatments.length; i++) {
        htmlarray.push(treatments[i]['so:sameAs'] + ' - ' + treatments[i]['label']);
        htmlarray.push('<br/>');
    }
    return htmlarray.join(' ');
}


/**
 * Query SeedStor API given an accession
 *
 * @param {String} accession - Accession name.
 * @param {String} plotId - Plot id.
 * @param {String} r - replicate number.
 */
function get_GRU_by_accession(accession, plotId, r) {
    $.ajax({
        type: "GET",
        url: '/seedstor/apisearch-unified.php?query=' + accession,
        dataType: "json",
        contentType: "application/json; charset=utf-8",
        success: function (gru_json) {
            var links = format_gru_json(gru_json);
            $('#' + plotId + '_' + r).html(links);
            // var linksjson = {};
            // linksjson['plotId'] = plotId;
            // linksjson['id'] = id;
            // linksjson['links'] = links;
            // plotsGRUArray.push(linksjson);
        }
    });
}


/**
 * Format SeedStor GRU JSON into html
 *
 * @param {String} gru_json - GRU returned JSON.
 */
function format_gru_json(gru_json) {
    var htmlarray = [];
    if (gru_json != undefined && gru_json.length > 0) {
        for (i = 0; i < gru_json.length; i++) {
            // if (gru_json.length > 0) {
            if (gru_json[0]['idPlant'] != undefined) {
                var idPlant = gru_json[i]['idPlant'];
                htmlarray.push('<a target="_blank" class="newstyle_link" href="https://www.seedstor.ac.uk/search-infoaccession.php?idPlant=' + idPlant + '">Plant ' + idPlant + '</a> ');
            }
        }
    }
    return htmlarray.join('');
}

/**
 * Get empty strings instead of undefeined variables
 *
 * @param {JSONObject} obj - The object to check.
 */
function SafePrint(obj) {
    if (obj === undefined || obj === null) {
        return "";
    } else {
        return obj;
    }
}

/**
 * Return defined string instead of undefeined variables
 *
 * @param {JSONObject} obj - The object to check.
 * @param {String} value - Display value if null or undefined.
 */
function SafePrint_with_value(obj, value) {
    if (obj === undefined || obj === null) {
        return value;
    } else {
        return obj;
    }
}


/**
 * Create request JSON to send to the apache backend for a given study id
 *
 * @param {String} exp_area_id - Study id.
 */
function CreatePlotsRequestForExperimentalArea(exp_area_id) {

    var request =
        {
            "services": [{
                "so:name": "Search Field Trials",
                "start_service": true,
                "parameter_set": {
                    "level": "advanced",
                    "parameters": [{
                        "param": "ST Id",
                        "current_value": exp_area_id
                    }, {
                        "param": "Get all Plots for Study",
                        "current_value": true
                    }, {
                        "param": "ST Search Studies",
                        "current_value": true
                    }]
                }
            }]
        };
    console.log(JSON.stringify(request));

    return request;
}

/**
 * Create request JSON to send to the apache backend for a given field trial id
 *
 * @param {String} fieldtrial_id - Study id.
 */
function CreatePlotsRequestForFieldTrial(fieldtrial_id) {

    var request = {
        "services": [{
            "start_service": true,
            "so:name": "Search Field Trials",
            "parameter_set": {
                "level": "advanced",
                "parameters": [
                    {
                        "param": "FT Id",
                        "current_value": fieldtrial_id
                    },
                    {
                        "param": "FT Trial Facet",
                        "current_value": true
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
    };

    console.log(JSON.stringify(request));

    return request;

}

/**
 * Create request JSON to send to the apache backend for a given string
 *
 * @param {String} keyword - Search string.
 */
function CreatePlotsRequestForAllFieldTrials(keyword) {
    // let facet = 'Study';
    // if (keyword === '') {
    //     facet = 'Field Trial';
    // }
    var request = {
        "services": [
            {
                "so:name": "Search Field Trials",
                "start_service": true,
                "parameter_set": {
                    "level": "simple",
                    "parameters": [
                        {
                            "param": "FT Keyword Search",
                            "current_value": keyword
                        },
                        {
                            "param": "FT Study Facet",
                            "current_value": true
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
            }
        ]
    };

    console.log(JSON.stringify(request));

    return request;

}

// plot page

let default_length = "";
let default_width = "";
let default_design = "";
let default_sowing_date = "";
let default_harvest_date = "";
let allPhenotypes = [];

/**
 * Create Plots table
 *
 * @param {JSON} experimental_area_json - Study JSON.
 */
function LoadTable(experimental_area_json) {
    $('#control').show();
    //console.log(JSON.stringify(experimental_area_json)); / very long, it crashes browser debugger**!!
    var jsonArray = experimental_area_json['results'][0]['results'];

    default_length = SafePrint(jsonArray[0]['data']['plot_length']);
    default_width = SafePrint(jsonArray[0]['data']['plot_width']);
    default_design = SafePrint(jsonArray[0]['data']['study_design']);
    default_sowing_date = SafePrint(jsonArray[0]['data']['sowing_date']);
    default_harvest_date = SafePrint(jsonArray[0]['data']['harvest_date']);

    // console.log(">>>>>>>>>>>>"+default_sowing_date);
    var filtered_data = [];
    jQuery('#status').html('');
    var fieldTrialName = '';
    var team = '';
    
    for (i = 0; i < jsonArray.length; i++) {
        let exp_area = jsonArray[i]['data'];
        // generate the plots table content
        let plots_table = GeneratePlotsForExperimentalArea(exp_area);
        $('#plots').html(plots_table);
        /*
                        for (j = 0; j < exp_areas_array.length; j++) {
                            let address = exp_areas_array [j]['address'];

                            if (address != undefined) {

                                fieldTrialName = jsonArray [i]['data']['so:name'];
                                team = jsonArray [i]['data']['team'];
                                if (address ['address']['location']['centre'] != undefined) {
                                    filtered_data.push (exp_areas_array [j]);
                                }
                            }
                        }
        */
    }
    // console.log(JSON.stringify(plotsHTMLArray));

}

/**
 * Create Plots table elements
 *
 * @param {JSON} experimental_area_json - Study JSON.
 */
function GeneratePlotsForExperimentalArea(experimental_area_json) {
    plot_json = experimental_area_json['plots'];
    let expAreaId = experimental_area_json['_id']['$oid'];
    let plots = experimental_area_json['plots'];

    let plot_block_rows = parseInt(experimental_area_json['plot_block_rows']);
    let plot_block_columns = parseInt(experimental_area_json['plot_block_columns']);

    s_formatted_treatments = generate_treatments_html(experimental_area_json);

   allPhenotypes =  experimental_area_json['phenotypes'];  // New variable for phenotypes 


    if (plots.length > 0) {
        var htmlarray = [];

        var row = 1;
        var column = 1;

        // MAIN LOOP 
	for (j = 0; j < plots.length; j++) {
        //for (j = 0; j < 3; j++) {


            if (plots[j]['row_index'] === row) {
                if (plots[j]['column_index'] === column) {
                    htmlarray.push(formatPlot(plots[j], plot_block_rows, plot_block_columns));
                    column++;
                }
            } else if (plots[j]['row_index'] > row) {

                let current_row = parseInt(plots[j]['row_index']);
                let current_column = parseInt(plots[j]['column_index']);
                row++;
                column = 2;
                htmlarray.push('</tr><tr>');
                let padding = plot_gap_calculator(current_column, current_row, plot_block_columns, plot_block_rows);
                htmlarray.push('<td  style="' + padding + '">' + row + '</td>');
                htmlarray.push(formatPlot(plots[j], plot_block_rows, plot_block_columns));
            }
        }
        var tableString = '<td>1</td>' + htmlarray.join("");
        var tableArray = tableString.split("</tr><tr>");
        var reversedString = tableArray.reverse().join("</tr><tr>");

        // return '<div id="plot"><table class="table " id="' + expAreaId + '" style="margin:20px; border-spacing:5px; border-collapse:separate;"><tr>' + reversedString + '</tr></table></div>';
        return '<div id="plot"><table class="table " id="' + expAreaId + '" style="margin:20px; "><tr>' + reversedString + '</tr></table></div>';
    } else {
        return '<div id="plot"><p>No plot data available.</p></div>'
    }
}

/**
 * Create Treatments table
 *
 * @param {JSON} experimental_area_json - Study JSON.
 */
function generate_treatments_html(experimental_area_json) {
    var htmlarray = [];
    if (experimental_area_json['treatment_factors'] !== undefined && experimental_area_json['treatment_factors'] !== null) {
        if (experimental_area_json['treatment_factors'].length > 0) {
            var treatment_factors = [];
            treatment_factors = experimental_area_json['treatment_factors'];

            htmlarray.push('<table class="table"><thead><tr><th>Treatment</th><th>Ontology term</th><th width="50%">Description</th><th>Values</th></tr></thead><tbody>');
            for (j = 0; j < treatment_factors.length; j++) {
                var treatment = treatment_factors[j];
                var ontology = treatment['treatment']['so:sameAs'];

                htmlarray.push('<tr>');
                htmlarray.push('<td>' + treatment['treatment']['so:name'] + '</td>');
                htmlarray.push('<td><a class="newstyle_link" target="_blank" href="https://browser.planteome.org/amigo/term/' + ontology + '">' + ontology + '</a></td>');
                htmlarray.push('<td>' + treatment['treatment']['so:description'] + '</td>');

                htmlarray.push('<td>');
                for (i = 0; i < treatment['values'].length; i++) {
                    var this_value = treatment['values'][i];
                    htmlarray.push(this_value['Label'] + ': ' + this_value['Value'] + '<br/>');
                }
                htmlarray.push('</td>');
                htmlarray.push('</tr>');
            }
            htmlarray.push('</tbody></table>');
        }
    }
    return htmlarray.join(' ');

}

/**
 * Search plots accessions with a given string from the page form input
 *
 */
function filter_plot() {
    $('.plot').css('background-color', '#ABEBC6');
    $('#filter_result').html('');
    var result = 0;
    var searchStr = $('#searchPlotsInput').val().toLowerCase();
    if (searchStr !== '') {
        for (i = 0; i < plot_json.length; i++) {
            // var bool = false;
            const plotId = plot_json[i]['_id']['$oid'];
            var rows = plot_json[i]['rows'];
            for (r = 0; r < rows.length; r++) {
                //var accession = rows[r]['material']['accession'].toLowerCase(); OLD structure
		if (rows[r]['discard'])
                {
                   var accession = 'discard';
                }
                else if (rows[r]['material'])
                {
                   var accession = rows[r]['material']['accession'].toLowerCase();
                }

                if (accession != undefined) {
                    if (searchStr === accession || accession.includes(searchStr)) {
                        // bool = true;
                        $('#' + plotId).css('background-color', '#2ECC40');
                        result++;
                        break;
                    }
                }
            }
            // if (bool) {
            //     var plotId = plot_json[i]['_id']['$oid'];
            //     console.log(plotId);
            //     $('#' + plotId).css('background-color', '#FF4136');
            // }
        }
    }
    $('#filter_result').html('<p>Filtered result: ' + result + '</p>');
}


// Use name of phenotype to look for a particular value given two keys
function lookup(name, key1, key2) {

	var result = allPhenotypes[name]['definition'][key1][key2]

    return result;

}


/**
 * Format rows of phenotypes values
 *
 * @param  plotCurrent  - Current Plot 
 * @param  replicateIds - Array containing ID of plots of exact replicates of current plot
 * @param  replicate      Rows of the exact replicates
 */

// For modal tables of individual observations in the plots.html template.
function format_pheno(plotCurrent, replicateIds, replicates, noReplicates){
   //console.log("--TEST ID ", plotCurrent['rows'][0]['study_index'] );
   // console.log("observation size current plot",  plotCurrent['rows'][0]['observations'].length );//    ******** ADD CHECK DISCARDED!

  let plot_actual_id = plotCurrent['rows'][0]['study_index'];
 
  let formatted_plot = {};
  let phenotypearray = [];

  var phenotypeRaw   = {};
	
  if (plotCurrent['rows'][0].hasOwnProperty('observations')) { 
    for (o = 0; o < plotCurrent['rows'][0]['observations'].length; o++) {

	    let observation    = plotCurrent['rows'][0]['observations'][o];
        let phenotype_name = observation['phenotype']['variable']; 

        phenotypeRaw[phenotype_name] = observation['raw_value'];      // Array of raw values of current plot
    }
  }

  var current_index    = plotCurrent['rows'][0]['replicate'];
  var color = colorJSON[current_index];
	
  let RawVals = [];
  let links   = [];	
  let colors  = [];	
 
  for (i = 0; i < replicateIds.length; i++) {
  
     let studyId = replicateIds[i] 
     let plot    = replicates[studyId];
     let plot_study_index = plot[0]['study_index'];
     //  console.log("replicate ID", plot_study_index);
     name_link = ' <u style="cursor:pointer;" onclick="plotModal(\'' + studyId + '\')">(Plot ' + plot_study_index + ')</u>';
     links.push(name_link);
     
     let replicate_index = plot[0]['replicate'];
     let color           = colorJSON[replicate_index];  
     colors.push(color);	  
	  
     let replicateRaw = {};
     if (plot[0].hasOwnProperty('observations')) {
       for (o = 0; o < plot[0]['observations'].length; o++) {

	    let observation    = plot[0]['observations'][o];
        let phenotype_name = observation['phenotype']['variable']; 

         replicateRaw[phenotype_name] = observation['raw_value'];
       }
     }
     RawVals.push(replicateRaw);	
  }
 //  console.log("raw values size replicate", Object.keys(replicateRaw).length );


   var crop_onotology_url = "https://cropontology.org/term/";	
  if (plotCurrent['rows'][0].hasOwnProperty('observations')) {
   for (o = 0; o < plotCurrent['rows'][0]['observations'].length; o++) {
        var observation    = plotCurrent['rows'][0]['observations'][o];
        var phenotype_name = observation['phenotype']['variable'];	
    
        // Start a new row in the table
        phenotypearray.push('<tr>');
        phenotypearray.push('<td style="background-color:' + color + '">' + SafePrint(current_index) + ' Plot ' + plot_actual_id + '(Current) </td>');
        phenotypearray.push('<td>' + SafePrint(plotCurrent['rows'][0]['rack_index']) + '</td>');
	    
       // Ensure correct pairing of date, raw value, and corrected value
       let observationDate = observation['date'] ? observation['date'].split('T')[0] : 'N/A';
       let rawValue = round2Fixed(SafePrint(observation['raw_value']));
       let correctedValue = SafePrint(observation['corrected_value']);

       // Add the date, raw value, and corrected value to the table
       phenotypearray.push('<td>' + observationDate + '</td>');
       phenotypearray.push('<td>' + rawValue + '</td>');
       phenotypearray.push('<td>' + correctedValue + '</td>');
	
	    // ******* Two extra columns of raw values of exact replicate plots. ********** 
	    if(noReplicates==false){
                phenotypearray.push('<td> No replicates </td>');
                phenotypearray.push('<td> No replicates </td>');
                console.log("No Replicates", noReplicates);
        }
        if(noReplicates==true){
		console.log("number of replicates: ", RawVals.length );
		if(RawVals.length >= 2){
                	for (i = 0; i < 2; i++) {    //ADD two extra columns for exact replicates
	                 let raw = {};
        	         raw = RawVals[i];
                	 link =links[i];

	                  phenotypearray.push('<td style="background-color:' + colors[i] + '">'+ round2Fixed(SafePrint(raw[phenotype_name]))  + '<br>'+ link  +'</td>');
                	}
		}
		if(RawVals.length == 1){
                	for (i = 0; i < 1; i++) {    //1 exact replicate only
	                 let raw = {};
        	         raw = RawVals[i];
                	 link =links[i];

	                  phenotypearray.push('<td style="background-color:' + colors[i] + '">'+ round2Fixed(SafePrint(raw[phenotype_name]))  + '<br>'+ link  +'</td>');
                	}
                        phenotypearray.push('<td> No replicate </td>');
		}
        }

       if (lookup( phenotype_name,  'trait', 'so:sameAs').startsWith('CO')) {
            phenotypearray.push('<td class="tooltip-test"  title="' + lookup(phenotype_name, 'trait','so:description') + '"><a class="newstyle_link" target="_blank" href="' + crop_onotology_url + lookup(phenotype_name, 'trait','so:sameAs') + '">' + lookup(phenotype_name, 'trait','so:name') + '</a></td>');

                } else {
                    phenotypearray.push('<td class="tooltip-test"  title="' + lookup(phenotype_name, 'trait','so:description')  + '">' + lookup(phenotype_name, 'trait','so:name')  + '</td>');
                }

                if (lookup( phenotype_name,  'measurement', 'so:sameAs').startsWith('CO')) {
                    phenotypearray.push('<td data-toggle="tooltip" title="' + lookup( phenotype_name,  'measurement', 'so:description') + '"><a class="newstyle_link" target="_blank" href="' + crop_onotology_url + lookup( phenotype_name,  'measurement', 'so:sameAs')  + '">' + lookup( phenotype_name,  'measurement', 'so:name') + '</td>');

                } else {
                    phenotypearray.push('<td data-toggle="tooltip" title="' + lookup(phenotype_name,  'measurement', 'so:description') + '">' + lookup(phenotype_name,  'measurement', 'so:name') + '</td>');
                }

                if (lookup( phenotype_name,  'unit', 'so:sameAs')) {
                    phenotypearray.push('<td data-toggle="tooltip"><a class="newstyle_link" target="_blank" href="' + crop_onotology_url + lookup(phenotype_name,  'unit', 'so:sameAs') + '">' + lookup(phenotype_name,  'unit', 'so:name')  + '</td>');

                } else {
                    phenotypearray.push('<td>' +  lookup(phenotype_name,  'unit', 'so:name')  + '</td>');
                }

                phenotypearray.push('<td>' + SafePrint(observation['index']) + '</td>');

                phenotypearray.push('<td>' + SafePrint(observation['notes']) + '</td>');

                phenotypearray.push('</tr>');
    
   }
  }

  formatted_plot['phenotypes'] = phenotypearray;

  return formatted_plot;


}



function areEqual(array1, array2) {
  if (array1.length === array2.length) {
    return array1.every((element, index) => {
      if (element === array2[index]) {
        return true;
      }

      return false;
    });
  }

  return false;
}


function round2Fixed(value) {

  if (isNaN(value))
    return value;

  if (Number.isInteger(value))
    return value;

  var  decimals = 2;
  n = countDecimals(value)
        if (n==1)
          decimals=1;
        if (n==2)
           decimals=2;
        if (n==3)
         decimals=2;
        if (n==4)
         decimals=2;
        if (n==5)
         decimals=4;
        if (n>6)
          decimals=4;


        //console.log("decimals", decimals, value)  
        var t = Math.pow(10, decimals);
        return (Math.round((value * t) + (decimals>0?1:0)*(Math.sign(value) * (10 / Math.pow(100, decimals)))) / t).toFixed(decimals);

}

var countDecimals = function (value) {
    if ((value % 1) != 0)
        return value.toString().split(".")[1].length;
    return 0;
}

