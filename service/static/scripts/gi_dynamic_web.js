var linked_services_global = {};
var textareas = [];
var synchronous = false;
var repeatable_groups = {};
var datatable_param_list = [];
var fieldTrailSearchType = '';
var level_simpleoradvanced = "simple";
var wizard_bool = false;
var wizard_count = 0;
// var refreshed = false;

var plots = [];

const service_blastn = 'blast-blastn';
const service_blastp = 'blast-blastp';
const service_blastx = 'blast-blastx';

const service_field_trial_search = 'field_trial-search';

const service_polymarker_search = 'polymarker-search';

const service_gru_seedbank_search = 'germplasm-search';

const service_pathogenomics_geoservice = 'pathogenomics-geoservice';

const field_trial_indexing = 'field_trial-indexing';

const grassroots_search = 'search';

// sudo service search_measured_variables
var search_measured_variables_json = {
    "@type": "grassroots_service",
    "so:name": "Search Measured Phenotype Variables",
    "so:description": "Search field trial measured phenotype variables",
    "so:alternateName": "field_trial-search_measured_variables",
    "provider": {
			"@type": "so:Organization",
		  "so:name": "Earlham Institute",
		  "so:description": "Earlham Institute's Grassroots server",
			"so:url": "https://grassroots.tools/",
		  "so:logo": "https://grassroots.tools/images/ei_logo.png"
    },
    "category": {
        "application_category": {
            "so:sameAs": "eo:topic_3810",
            "so:name": "Agricultural science",
            "so:description": "Multidisciplinary study, research and development within the field of agriculture."
        },
        "application_subcategory": {
            "so:sameAs": "eo:operation_3431",
            "so:name": "Deposition",
            "so:description": "Deposit some data in a database or some other type of repository or software system."
        },
        "input": [
            {
                "so:sameAs": "eo:data_0968",
                "so:name": "Keyword",
                "so:description": "Boolean operators (AND, OR and NOT) and wildcard characters may be allowed. Keyword(s) or phrase(s) used (typically) for text-searching purposes."
            }
        ],
        "output": [
            {
                "so:sameAs": "so:measurementTechnique",
                "so:name": "measurementTechnique",
                "so:description": "Measurement technique."
            }
        ]
    },
    "operation": {
        "so:image": "https://grassroots.tools/grassroots/images/aiss/polygonchange"
    }
};


// sudo service search_treatments
var search_treatments_json = {
    "@type": "grassroots_service",
    "so:name": "Search Treatments",
    "so:description": "Search field trial treatments",
    "so:alternateName": "field_trial-search_treatments",
    "provider": {
			"@type": "so:Organization",
		  "so:name": "Earlham Institute",
		  "so:description": "Earlham Institute's Grassroots server",
			"so:url": "https://grassroots.tools/",
		  "so:logo": "https://grassroots.tools/images/ei_logo.png"
    },
    "category": {
        "application_category": {
            "so:sameAs": "eo:topic_3810",
            "so:name": "Agricultural science",
            "so:description": "Multidisciplinary study, research and development within the field of agriculture."
        },
        "application_subcategory": {
            "so:sameAs": "eo:operation_3431",
            "so:name": "Deposition",
            "so:description": "Deposit some data in a database or some other type of repository or software system."
        },
        "input": [
            {
                "so:sameAs": "eo:data_0968",
                "so:name": "Keyword",
                "so:description": "Boolean operators (AND, OR and NOT) and wildcard characters may be allowed. Keyword(s) or phrase(s) used (typically) for text-searching purposes."
            }
        ],
        "output": [
            {
                "so:sameAs": "so:measurementTechnique",
                "so:name": "measurementTechnique",
                "so:description": "Measurement technique."
            }
        ]
    },
    "operation": {
        "so:image": "https://grassroots.tools/grassroots/images/aiss/polygonchange"
    }
};

/**
 * Get all services from backend and list them as a table
 *
 */
function get_all_services_as_table() {

    // $('#form').html("<table id=\"listTable\">Loading services...</table>");

    $.ajax({
        // urls.py to views.py to grassroots_requests.py then to apache backend
        url: root_dir + "service/ajax/interact_backend/",
        type: "POST",
        headers: {
            'X-CSRFToken': csrftoken,
						"Authorization": "Bearer " + loaclStorage.getItem ("access_token")
        },
        data: services,
        dataType: "json",
        success: function (json) {
            console.info(JSON.stringify(json));
            // var list_html = [];
            // list_html.push('<h3>Click any of the service to load the form</h3>');
            // list_html.push('<ul>');
            // for (var j = 0; j < json['services'].length; j++) {
            //     var service_name = json['services'][j]['service_name'];
            //     var icon_uri = json['services'][j]['operations']['icon_uri'];
            //     list_html.push('<li class="newstyle_link" onclick="populateService(\'' + service_name + '\')"><img src="' + icon_uri + '"/><u>' + service_name + '</u></li>');
            // }
            // list_html.push('</ul>');
            // $('#form').html(list_html.join(' '));
            var service_list_json = [];
            service_list_json = json['services'];
            // if (server_url !== "/private_backend") {
            service_list_json.push(search_measured_variables_json);
            service_list_json.push(search_treatments_json);
            // }
            var context_json = json['@context'];
            var listTable = jQuery('#listTable').DataTable({
                data: service_list_json,
                searchHighlight: true,
                scrollX: true,
                scrollCollapse: true,
                "paging": false,
                "columns": [
                    {
                        title: "Service",
                        "render": function (data, type, full, meta) {
                            // return '<div class="newstyle_link" onclick="populateService(\'' + full['so:name'] + '\')"><img src="' + full['operations']['so:image'] + '"/> <u>' + full['so:name'] + '</u></div>';
                            return '<a class="newstyle_link" href="' + full['so:alternateName'] + '"><img src="' + full['operation']['so:image'] + '"/> <u>' + full['so:name'] + '</u></a>';
                        }
                    },
                    {data: "so:description", title: "Description", "sDefaultContent": ""},
                    {
                        title: "Provider",
                        "render": function (data, type, full, meta) {
                            var provider_html = [];
                            provider_html.push('<ul class="list_service_table_ul">');
                            if (full['provider'] != undefined) {
                                var this_provider = full['provider'];
                                provider_html.push('<li title="' + this_provider['so:description'] + '"><img src="' + this_provider['so:logo'] + '" height="20px"/> <a target="_blank" href="' + this_provider['so:url'] + '" class="newstyle_link" >' + this_provider['so:name'] + '</a></li>');

                            } else if (full['providers'] != undefined) {
                                for (var proi = 0; proi < full['providers'].length; proi++) {
                                    var this_provider = full['providers'][proi];
                                    provider_html.push('<li title="' + this_provider['so:description'] + '"><img src="' + this_provider['so:logo'] + '" height="20px"/> <a target="_blank" href="' + this_provider['so:url'] + '" class="newstyle_link" >' + this_provider['so:name'] + '</a></li>');
                                }
                            }
                            provider_html.push('</ul>');
                            return provider_html.join(' ');
                        }
                    },
                    {
                        title: "Application Category",
                        "render": function (data, type, full, meta) {
                            return '<div title="' + full['category']['application_category']['so:description'] + '"><a target="_blank" href="' + ontology_links(context_json, full['category']['application_category']['so:sameAs']) + '" class="newstyle_link">' + full['category']['application_category']['so:name'] + '</a></div>';
                        }
                    },
                    {
                        title: "Application Sub-Category",
                        "render": function (data, type, full, meta) {
                            if (full['category']['application_subcategory'] != undefined) {
                                return '<div title="' + full['category']['application_subcategory']['so:description'] + '"><a target="_blank" href="' + ontology_links(context_json, full['category']['application_subcategory']['so:sameAs']) + '" class="newstyle_link">' + full['category']['application_subcategory']['so:name'] + '</a></div>';

                            } else {
                                return '';
                            }
                        }
                    },
                    {
                        title: "Input",
                        "render": function (data, type, full, meta) {
                            var input_html = [];
                            input_html.push('<ul class="list_service_table_ul">');
                            for (var ini = 0; ini < full['category']['input'].length; ini++) {
                                var this_input = full['category']['input'][ini];
                                input_html.push('<li title="' + this_input['so:description'] + '"><a target="_blank" href="' + ontology_links(context_json, this_input['so:sameAs']) + '">' + this_input['so:name'] + '</a></li>');
                            }
                            input_html.push('</ul>');
                            return input_html.join(' ');
                        }
                    },
                    {
                        title: "Output",
                        "render": function (data, type, full, meta) {
                            var output_html = [];
                            output_html.push('<ul class="list_service_table_ul">');
                            for (var outi = 0; outi < full['category']['output'].length; outi++) {
                                var this_output = full['category']['output'][outi];
                                output_html.push('<li title="' + this_output['so:description'] + '"><a target="_blank" href="' + ontology_links(context_json, this_output['so:sameAs']) + '">' + this_output['so:name'] + '</a></li>');
                            }
                            output_html.push('</ul>');
                            return output_html.join(' ');
                        }
                    }


                ]
            });
        }
    });

    $('#back_link').css('visibility', 'hidden');
}

/**
 * Display all services as a table with given JSON
 *
 * @param {JSON} json - All services JSON.
 */
function display_all_services_as_table(json) {

    // $('#form').html("<table id=\"listTable\">Loading services...</table>");

    console.info(JSON.stringify(json));
    var service_list = json['services'];
    if (publicOrPrivate === '') {
        service_list.push(search_measured_variables_json);
        service_list.push(search_treatments_json);
    }
    var context_json = json['@context'];
    var listTable = jQuery('#listTable').DataTable({
        data: service_list,
        searchHighlight: true,
        scrollX: true,
        scrollCollapse: true,
        "paging": false,
        "columns": [
            {
                title: "Service",
                "render": function (data, type, full, meta) {
                    // return '<div class="newstyle_link" onclick="populateService(\'' + full['so:name'] + '\')"><img src="' + full['operations']['so:image'] + '"/> <u>' + full['so:name'] + '</u></div>';
                    return '<a class="newstyle_link" href="' + full['so:alternateName'] + '"><img src="' + full['operation']['so:image'] + '"/> <u>' + full['so:name'] + '</u></a>';
                }
            },
            {data: "so:description", title: "Description", "sDefaultContent": ""},
            {
                title: "Provider",
                "render": function (data, type, full, meta) {
                    var provider_html = [];
                    provider_html.push('<ul class="list_service_table_ul">');
                    if (full['provider'] != undefined) {
                        var this_provider = full['provider'];
                        provider_html.push('<li title="' + this_provider['so:description'] + '"><img src="' + this_provider['so:logo'] + '" height="20px"/><a target="_blank" href="' + this_provider['so:url'] + '" class="newstyle_link" >' + this_provider['so:name'] + '</a></li>');

                    } else if (full['providers'] != undefined) {
                        for (var proi = 0; proi < full['providers'].length; proi++) {
                            var this_provider = full['providers'][proi];
                            provider_html.push('<li title="' + this_provider['so:description'] + '"><img src="' + this_provider['so:logo'] + '" height="20px"/><a target="_blank" href="' + this_provider['so:url'] + '" class="newstyle_link" >' + this_provider['so:name'] + '</a></li>');
                        }
                    }
                    provider_html.push('</ul>');
                    return provider_html.join(' ');
                }
            },
            {
                title: "Application Category",
                "render": function (data, type, full, meta) {
                    return '<div title="' + full['category']['application_category']['so:description'] + '"><a target="_blank" href="' + ontology_links(context_json, full['category']['application_category']['so:sameAs']) + '" class="newstyle_link">' + full['category']['application_category']['so:name'] + '</a></div>';
                }
            },
            {
                title: "Application Sub-Category",
                "render": function (data, type, full, meta) {
                    if (full['category']['application_subcategory'] != undefined) {
                        return '<div title="' + full['category']['application_subcategory']['so:description'] + '"><a target="_blank" href="' + ontology_links(context_json, full['category']['application_subcategory']['so:sameAs']) + '" class="newstyle_link">' + full['category']['application_subcategory']['so:name'] + '</a></div>';

                    } else {
                        return '';
                    }
                }
            },
            {
                title: "Input",
                "render": function (data, type, full, meta) {
                    var input_html = [];
                    input_html.push('<ul class="list_service_table_ul">');
                    for (var ini = 0; ini < full['category']['input'].length; ini++) {
                        var this_input = full['category']['input'][ini];
                        input_html.push('<li title="' + this_input['so:description'] + '"><a target="_blank" href="' + ontology_links(context_json, this_input['so:sameAs']) + '">' + this_input['so:name'] + '</a></li>');
                    }
                    input_html.push('</ul>');
                    return input_html.join(' ');
                }
            },
            {
                title: "Output",
                "render": function (data, type, full, meta) {
                    var output_html = [];
                    output_html.push('<ul class="list_service_table_ul">');
                    for (var outi = 0; outi < full['category']['output'].length; outi++) {
                        var this_output = full['category']['output'][outi];
                        output_html.push('<li title="' + this_output['so:description'] + '"><a target="_blank" href="' + ontology_links(context_json, this_output['so:sameAs']) + '">' + this_output['so:name'] + '</a></li>');
                    }
                    output_html.push('</ul>');
                    return output_html.join(' ');
                }
            }


        ]
    });

    $('#back_link').css('visibility', 'hidden');
}

/**
 * Format ontology links
 *
 * @param {JSON} context_json - Ontology context JSON.
 * @param {String} ontology_ref - Ontology reference string.
 */
function ontology_links(context_json, ontology_ref) {
    var ontology_array = ontology_ref.split(':');
    var prefix = ontology_array[0] + ':';
    // console.log(prefix);
    return context_json[prefix] + ontology_array[1];
}

/**
 * Populate a service with a give alternative name
 *
 * @param {String} service_altname - service alternative string.
 */
function populateService(service_altname) {
    $('#back_link').css('visibility', 'visible');
    // $('#title').html('Search Treatment');
    // $('#description').html('Search field trial treatment');
    $('#simpleAdvanceWrapper').show();
    selected_service_name = service_altname;
    if (selected_service_name === 'field_trial-search_measured_variables') {
        $('#title').html('Search Measured Phenotype Variables');
        $('#description').html('<p>As you start to type in the search box, Measured Phenotype Variables will be returned that match your query.</p>' +
            '<p>It is good practice to include these terms to describe your phenotype data wherever possible as the Variable Name is unique, and this reduces ambiguity or confusion when describing your phenotype measurements or measurement method. The Measured Phenotype Variables suggested by this service come mainly from <a  target="_blank" href="https://www.cropontology.org/ontology/CO_321/Wheat">Wheat Crop Ontology</a>' +
            ' but specialised variables can be added to the system. Please contact us if that is necessary.</p>' +
            '<p>This search system allows you to click on a row to copy the Variable Name, which can then be pasted as a column header in your spreadsheet, or any other documentation or publications.' +
            'To find variables available, start by typing the search phrase into the search box, results will appear below as a table. Select the row and press the copy button, the variable name of the row will be copied to the clipboard for you to' +
            'paste into the plots page.</p>');
        $('#moreinfo').html('For more information and help, go to the <a target="_blank" href="https://grassroots.tools/docs/user/services/field_trial/search_measured_variables.md" target="_blank">user documentation</a>');
        var form_html = [];

        // form_html.push('<p>Start searching by entering query into the search box and then click each result row to copy the variable name to you clipboard to paste into your field trail spreadsheet.</p>');
        form_html.push('<label title="Search the field trial data">Search measured phenotype variables in the box below <i class="fas fa-arrow-right"></i>' +
            ' Click (Ctrl click to select multi-rows) result rows to copy it to clipboard <i class="fas fa-arrow-right"></i>' +
            ' Paste into your field trial spread sheet or export as excel.</label>');

        // ajax stuff here
        form_html.push('<input id="ft_ajax_search" type="text" class="form-control"  name="search_treatment_ajax" value="" onkeyup="do_ajax_search(\'Measured Variable\');"/>');
        form_html.push('<div id="ajax_result"></div>');
        form_html.push('</div>');
        $('#form').html(form_html.join(' '));

    } else if (selected_service_name === 'field_trial-search_treatments') {
        $('#title').html('Search Treatments');
        $('#description').html('Search field trial treatments');
        $('#moreinfo').html('For more information and help, go to the <a href="https://grassroots.tools/docs/user/services/field_trial/search_treatments.md" target="_blank">user documentation</a>');
        var form_html = [];

        // form_html.push('<p>Start searching by entering query into the search box and then click each result row to copy the variable name to you clipboard to paste into your field trail spreadsheet.</p>');
        form_html.push('<label title="Search the field trial data">Search treatment in the box below <i class="fas fa-arrow-right"></i>' +
            ' Click (Ctrl click to select multi-rows) result rows to copy it to clipboard <i class="fas fa-arrow-right"></i>' +
            ' Paste into your field trial spread sheet or export as excel.</label>');

        // ajax stuff here
        form_html.push('<input id="ft_ajax_search" type="text" class="form-control"  name="search_treatment_ajax" value="" onkeyup="do_ajax_search(\'Treatment\');"/>');
        form_html.push('<div id="ajax_result"></div>');
        form_html.push('</div>');
        $('#form').html(form_html.join(' '));
    // private goes to private/
    } else if (selected_service_name === 'private') {
        window.location.href = root_dir + "service/private/";
     // queen goes to queen/
    } else if (selected_service_name === 'queen') {
        window.location.href = root_dir + "service/queen/";
    } else {
        var post_data = '{"services": [{"so:alternateName":"' + service_altname + '"}], "operations": {"operation": "get_named_service"}}';
        $.ajax({
            url: root_dir + "service/" + publicOrPrivate + "ajax/interact_backend/",
            type: "POST",
            headers: {
                'X-CSRFToken': csrftoken
            },
            data: post_data,
            dataType: "json",
            success: function (json) {
                populate_page_with_json(json, false);
            }
        });
    }
}

/**
 * Populate a service with a payload for opening a new service page with predefined parameters
 *
 * @param {String} payload - Payload string from backend.
 */
function populateServiceWithPayload(payload) {
    $('#back_link').css('visibility', 'visible');
    // $('#title').html('Search Treatment');
    // $('#description').html('Search field trial treatment');
    $('#simpleAdvanceWrapper').show();

    var data = decodeURIComponent(payload);
    console.log('payload sent to server: ' + data);
    $.ajax({
        url: root_dir + "service/ajax/interact_backend/",
        type: "POST",
        headers: {
            'X-CSRFToken': csrftoken
        },
        data: '' + data + '',
        // data:'{"services": [{"so:name":"' + service_altname + '"}], "operations": {"operation": "get_named_service"}}',
        dataType: "json",
        success: function (json) {
            var service_altname = json['services'][0]['so:alternateName'];
            console.log('payload test: service altname' + service_altname);
            selected_service_name = service_altname;
            populate_page_with_json(json, false);
        }
    });
}


/**
 * Populate the search service with a string
 *
 * @param {String} q - search string.
 */
function populateSearchWithQ(q) {
    $('#back_link').css('visibility', 'visible');
    // $('#title').html('Search Treatment');
    // $('#description').html('Search field trial treatment');
    $('#simpleAdvanceWrapper').show();

    // var data = decodeURIComponent(payload);
    $.ajax({
        url: root_dir + "service/ajax/interact_backend/",
        type: "POST",
        headers: {
            'X-CSRFToken': csrftoken
        },
        data: '{"services": [{"so:alternateName":"search"}], "operations": {"operation": "get_named_service"}}',
        dataType: "json",
        success: function (json) {
            selected_service_name = grassroots_search;
            populate_page_with_json(json, false);
            $('#SS_Keyword_Search').val(q);
        }
    });
    $.ajax({
        url: root_dir + "service/ajax/interact_backend/",
        type: "POST",
        headers: {
            'X-CSRFToken': csrftoken
        },
        data: '{"services":[{"start_service":true,"so:alternateName":"search","parameter_set":{"level":"simple","parameters":[{"param":"SS Keyword Search","current_value":"' + q + '"},{"param":"SS Facet","current_value":"<ANY>"},{"param":"SS Results Page Number","current_value":0},{"param":"SS Results Page Size","current_value":500}]}}]}',
        type: "POST",
        dataType: "json",
        success: function (json) {
            display_result(json);
        }
    });
}


var MAX_BYTES = 409600; // 100 KB

/**
 * Handle dragging enter
 *
 * @param {Event} event - dragging event.
 */
function dragEnter(event) {
    console.log('dragEnter', event);
    event.stopPropagation();
    event.preventDefault();
}

/**
 * Handle dragging exit
 *
 * @param {Event} event - dragging event.
 */
function dragExit(event) {
    console.log('dragExit', event);
    event.stopPropagation();
    event.preventDefault();
}

/**
 * Handle dragging over
 *
 * @param {Event} event - dragging event.
 */
function dragOver(event) {
    console.log('dragOver', event);
    event.stopPropagation();
    event.preventDefault();
}

/**
 * Handle drop
 *
 * @param {Event} event - drop event.
 */
function drop(event) {

    console.log('drop', event);
    event.stopPropagation();
    event.preventDefault();

    var data = event.dataTransfer;
    var files = data.files;
    var file;
    var reader;

    for (var i = 0; i < files.length; i++) {
        file = files[i];
        console.log(file, file.fileName);
        // $('#' + String(event.target.id)).attr('name', file.fileName);
        console.log((event.target.id));
        reader = new FileReader();
        // reader.onloadend = onFileLoaded;
        reader.onloadend = function (e) {
            onFileLoaded(e, event.target.id);
        };
        reader.readAsBinaryString(file);
        //reader.readAsDataURL(file);
    }
}

/**
 * Handle loading file
 *
 * @param {Event} event - dragging event.
 * @param {String} tid - textarea id.
 */
function onFileLoaded(event, tid) {
    console.log('onFileLoaded', event);
    var initialData = event.currentTarget.result.substr(0, MAX_BYTES);
    $('#' + tid).text(initialData);
}

/**
 * Populate page with service JSON from backend
 *
 * @param {JSON} json - JSON from backend.
 * @param {Boolean} refreshed - Boolean to show if this page was refreshed from one of the parameters.
 */
function populate_page_with_json(json, refreshed) {
    response = json;
    console.info(JSON.stringify(json));
    if (response['services'] !== undefined) {
        if (response['services'].length > 0) {
            if (response['services'][0]['so:name'] !== undefined) {
                $('#title').html(response['services'][0]['so:name']);
            }
            if (response['services'][0]['so:description'] !== undefined) {
                $('#description').html(response['services'][0]['so:description']);
            }
            if (response['services'][0]['operation']['so:url'] !== undefined) {
                var infoLink = response['services'][0]['operation']['so:url'];
                $('#moreinfo').html('For more information and help, go to the <a href="' + infoLink + '" target="_blank">user documentation</a>');
            }
        }
    }

    parameters = response['services'][0]['operation']['parameter_set']['parameters'];
    groups = response['services'][0]['operation']['parameter_set']['groups'];
    synchronous = response['services'][0]['operation']['synchronous'];
    console.info('synchronous' + synchronous);
    produce_form('form', parameters, groups, refreshed);
    simpleOrAdvanced(get_simpleOrAdvanced());
    for (var i = 0; i < textareas.length; i++) {
        // document.getElementById(textareas[i]).addEventListener('dragover', handleDragOver, false);
        // document.getElementById(textareas[i]).addEventListener('drop', handleFileSelect, false);
        document.getElementById(textareas[i]).addEventListener('dragenter', dragEnter, false);
        document.getElementById(textareas[i]).addEventListener('dragexit', dragExit, false);
        document.getElementById(textareas[i]).addEventListener('dragover', dragOver, false);
        document.getElementById(textareas[i]).addEventListener('drop', drop, false);
    }
    $('.datepicker').datepicker({dateFormat: 'yy-mm-dd'});
    for (var idt = 0; idt < datatable_param_list.length; idt++) {
        var datatableId = datatable_param_list[idt]['table_id'];
        var buttons = [];
        // DAN  ? -- $('#' + datatableId).DataTable().destroy();
        if (datatableId === 'PL_Upload') {
            //########## NEW correction, no table ###########
            if (selected_service_name !== 'field_trial-submit_plots'){   // DAN 2023 
            add_plot_datatable(datatableId);   // remove table and edit button in submit plot service
            }
        } else {
            var ndt = $('#' + datatableId).DataTable({
                scrollX: true,
                "paging": false,
                "aaSorting": [],
                dom: 'lBfrtip',
                buttons: [
                    {
                        text: 'Add Row',
                        className: 'btn btn-success new_row_button',
                        action: function (e, dt, node, config) {

                            table_add_new_row(dt.table().node().id);
                        }
                    },
                    $.extend(true, {}, buttonCommon, {
                        extend: 'excelHtml5',
                        className: 'btn btn-success new_row_button',
                        titleAttr: 'Export to Excel',
                        // text:'New Export',
                        title: null,
                        messageTop: null,
                        messageBottom: null
                    })
                ]
            });

            $('#' + datatableId).on('change', 'input', function () {
                //Get the cell of the input
                var cell = $(this).closest('td');

                //update the input value
                $(this).attr('value', $(this).val());

                //invalidate the DT cache
                ndt.cell($(cell)).data($(cell).html()).invalidate().draw();

            });
        }
        // if (datatableId != 'PL_Upload') {
        //     table_add_new_row(datatableId);
        // }

        document.getElementById(datatableId + ':drop').addEventListener('dragover', handleDragOver, false);
        document.getElementById(datatableId + ':drop').addEventListener('drop', handleXlsxFileSelect, false);
    }

}


var buttonCommon = {
    exportOptions: {
        format: {
            body: function (data, row, column, node) {
                return $(data).val();
            }
        }
    }
};

/**
 * Query SeedStor API given an accession
 *
 * @param {String} accession - Accession name.
 * @param {String} name - Input name.
 */
function check_GRU_by_accession(accession, name) {
    console.log('check gru ' + accession);
    var bool = false;
    $.ajax({
        type: "GET",
        url: '/seedstor/apisearch-unified.php?query=' + accession,
        dataType: "json",
        contentType: "application/json; charset=utf-8",
        success: function (gru_json) {

            console.log(gru_json);
            if (gru_json != undefined && gru_json.length > 0) {
                $('input[name ="' + name + '"]').css({'background-color': '#A2FF33'});
            } else {
                $('input[name ="' + name + '"]').css({'background-color': '#07C9FD'});
            }
        }
    });
    return bool;
}

/**
 * Produce form for a given service
 *
 * @param {String} div - div id.
 * @param {JSONArray} parameters - Parameters JSONArray.
 * @param {JSONArray} groups - Groups JSONArray.
 * @param {Boolean} refreshed - Refreshed boolean to show if the page was refreshed.
 */
function produce_form(div, parameters, groups, refreshed) {
    repeatable_groups = {};
    datatable_param_list = [];
    var form_html = [];
    if (groups.length > 0) {
        var parameters_added = [];
        for (var j = 0; j < groups.length; j++) {
            var group_level = 'all';
            if (groups[j]['level'] != undefined) {
                group_level = groups[j]['level'];
            }
            if (groups[j]['repeatable']) {
                var group_random_id = generate_random_id();
                // if (groups[j]['so:name'] === 'Treatment Factors') {
                //     group_random_id = "treatmentfactors";
                // }
                // repeatable stuff here
                form_html.push('<fieldset class="' + group_level + '">');
                form_html.push('<legend class="' + group_level + '">' + groups[j]['so:name'] + ' <span class="fas fa-plus" onclick="add_group_parameter(\'' + group_random_id + '\')"></span></legend>');
                form_html.push('<div id="' + group_random_id + '">');

                var this_group = {};

                this_group['so:name'] = groups[j]['so:name'];
                this_group['counter'] = 0;

                // console.log(JSON.stringify(this_group));
                repeatable_groups[group_random_id] = this_group;
                var this_group_parameters = [];

                var this_group_repeat_no = 0;
                if (refreshed) {
                    for (var i = 0; i < parameters.length; i++) {
                        if (groups[j]['so:name'] == parameters[i]['group']) {
                            if (parameters[i]['current_value'] !== null) {
                                if (parameters[i]['grassroots_type'] === "xsd:string") {
                                    this_group_repeat_no = 1;
                                } else {
                                    this_group_repeat_no = parameters[i]['current_value'].length;

                                    console.log("repeat: " + this_group_repeat_no);
                                }
                            }
                            break;
                        }
                    }
                }
                if (this_group_repeat_no > 1) {
                    for (var r = 0; r < this_group_repeat_no; r++) {
                        repeatable_groups[group_random_id]['counter'] = r;
                        for (var i = 0; i < parameters.length; i++) {
                            if (groups[j]['so:name'] == parameters[i]['group']) {
                                var this_parameter = {};
                                this_parameter['group'] = parameters[i]['group'];
                                this_parameter['grassroots_type'] = parameters[i]['grassroots_type'];
                                if (parameters[i]['grassroots_type'] === "params:string_array") {
                                    this_parameter['grassroots_type'] = "xsd:string";
                                }
                                this_parameter['level'] = parameters[i]['level'];
                                this_parameter['so:description'] = parameters[i]['so:description'];
                                this_parameter['so:name'] = parameters[i]['so:name'];
                                this_parameter['current_value'] = parameters[i]['current_value'][r];
                                this_parameter['default_value'] = parameters[i]['default_value'][r];
                                if (this_parameter['grassroots_type'] === "params:tabular" || this_parameter['grassroots_type'] === "params:json_array") {
                                    this_parameter['store'] = parameters[i]['store'];
                                    this_parameter['param'] = parameters[i]['param'] + '-' + r;
                                } else {
                                    this_parameter['param'] = parameters[i]['param'];
                                }

                                form_html.push(produce_one_parameter_form(this_parameter, true, group_random_id, true));
                                parameters_added.push(parameters[i]['param']);
                                if (r === 0) {
                                    this_group_parameters.push(parameters[i]);
                                }
                            }
                        }
                    }
                } else if (this_group_repeat_no === 1) {
                    for (var r = 0; r < this_group_repeat_no; r++) {
                        repeatable_groups[group_random_id]['counter'] = r;
                        for (var i = 0; i < parameters.length; i++) {
                            if (groups[j]['so:name'] == parameters[i]['group']) {
                                var this_parameter = {};
                                this_parameter['group'] = parameters[i]['group'];
                                this_parameter['grassroots_type'] = parameters[i]['grassroots_type'];

                                // this_parameter['grassroots_type'] = "xsd:string";

                                this_parameter['level'] = parameters[i]['level'];
                                this_parameter['so:description'] = parameters[i]['so:description'];
                                this_parameter['so:name'] = parameters[i]['so:name'];
                                if (this_parameter['grassroots_type'] === "params:tabular" || this_parameter['grassroots_type'] === "params:json_array") {
                                    this_parameter['store'] = parameters[i]['store'];
                                    this_parameter['param'] = parameters[i]['param'] + '-' + r;
                                    this_parameter['current_value'] = parameters[i]['current_value']['values'];
                                    this_parameter['default_value'] = parameters[i]['default_value']['values'];
                                } else {
                                    this_parameter['param'] = parameters[i]['param'];
                                    this_parameter['current_value'] = parameters[i]['current_value'];
                                    this_parameter['default_value'] = parameters[i]['default_value'];
                                }

                                form_html.push(produce_one_parameter_form(this_parameter, true, group_random_id, true));
                                parameters_added.push(parameters[i]['param']);
                                if (r === 0) {
                                    this_group_parameters.push(parameters[i]);
                                }
                            }
                        }
                    }
                } else {
                    for (var gi = 0; gi < parameters.length; gi++) {
                        if (groups[j]['so:name'] == parameters[gi]['group']) {
                            form_html.push(produce_one_parameter_form(parameters[gi], true, group_random_id, false));
                            parameters_added.push(parameters[gi]['param']);
                            this_group_parameters.push(parameters[gi]);
                        }
                    }
                }

                repeatable_groups[group_random_id]['parameters'] = this_group_parameters;
                form_html.push('</div>');
                form_html.push('</fieldset>');
            } else {
                if (groups[j]['visible'] || groups[j]['visible'] == undefined) {
                    form_html.push('<fieldset class="' + group_level + '">');
                    form_html.push('<legend>' + groups[j]['so:name'] + '</legend>');
                    for (var ei = 0; ei < parameters.length; ei++) {
                        if (groups[j]['so:name'] == parameters[ei]['group']) {
                            form_html.push(produce_one_parameter_form(parameters[ei], false, null, false));
                            parameters_added.push(parameters[ei]['param']);
                        }
                    }
                    form_html.push('</fieldset>');
                } else {
                    var random_id = generate_random_id();
                    form_html.push('<fieldset class="' + group_level + '">');
                    form_html.push('<legend><a href="#' + random_id + '"  data-toggle="collapse">' + groups[j]['so:name'] + '</a></legend>');

                    form_html.push('<div id="' + random_id + '"  class="collapse">');
                    for (var fi = 0; fi < parameters.length; fi++) {
                        if (groups[j]['so:name'] == parameters[fi]['group']) {
                            form_html.push(produce_one_parameter_form(parameters[fi], false, null, false));
                            parameters_added.push(parameters[fi]['param']);
                        }
                    }
                    form_html.push('</div>');
                    form_html.push('</fieldset>');
                }
            }
        }
        // console.log(parameters_added);
        // add parameters not in the group
        for (var ip = 0; ip < parameters.length; ip++) {
            if (!isInArray(parameters[ip]['param'], parameters_added)) {
                // console.log(parameters[ip]['param']);
                form_html.push(produce_one_parameter_form(parameters[ip], false, null, false));
            }
        }
    } else {
        for (var i = 0; i < parameters.length; i++) {
            form_html.push(produce_one_parameter_form(parameters[i], false, null, false));
        }
    }

    form_html.push('<input id="submit_button" class="btn btn-secondary" type="button" onclick="submit_form();" value="Submit">');
    if (wizard_bool) {
        if (wizard_count === 0) {
            form_html.push('<input id="skip_button1" class="btn btn-secondary" type="button" onclick="window.location.href = \'fieldtrial_submission.html?step=2\';" value="Skip & Add Location"> '
                + '<input id="skip_button2" class="btn btn-secondary" type="button" onclick="window.location.href = \'fieldtrial_submission.html?step=4\';" value="Skip & Add Study">');
        }
    }

    $('#' + div).html(form_html.join(' '));
    $('#' + div).validator({
        custom: {
            "fasta": function ($el) {
                if (!validateFasta($el.val())) {
                    return "Please insert valid FASTA format";
                }
            }
        }
    });
}

/**
 * Add a parameter to repeatable_groups global var
 *
 * @param {String} group_id - Group id.
 */
function add_group_parameter(group_id) {
    // console.log(JSON.stringify(repeatable_groups));
    // var counter = repeatable_groups[group_id]['counter']++;
    ++repeatable_groups[group_id]['counter'];

    // console.log(JSON.stringify(repeatable_groups));
    var group_parameters = repeatable_groups[group_id]['parameters'];
    for (var i = 0; i < group_parameters.length; i++) {
        $('#' + group_id).append(produce_one_parameter_form(group_parameters[i], true, group_id, false));
        // if(group_id === 'treatmentfactors' && group_parameters[i]['param'] == 'TF Levels'){
        var grassroots_type = group_parameters[i]['grassroots_type'];
        if (grassroots_type === "params:tabular" || grassroots_type === "params:json_array") {
            var table_id = group_parameters[i]['param'].replace(/ /g, "_") + '-' + repeatable_groups[group_id]['counter'];
            $('#' + table_id).DataTable({
                scrollX: true,
                "paging": false,
                "aaSorting": [],
                dom: 'lBfrtip',
                buttons: [
                    {
                        text: 'Add Row',
                        className: 'btn btn-success new_row_button',
                        action: function (e, dt, node, config) {
                            table_add_new_row(dt.table().node().id);
                        }
                    },
                    $.extend(true, {}, buttonCommon, {
                        extend: 'excelHtml5',
                        className: 'btn btn-success new_row_button',
                        titleAttr: 'Export to Excel',
                        // text:'New Export',
                        title: null,
                        messageTop: null,
                        messageBottom: null
                    })
                ]
            });
        }
    }
    alert('Added one set.');
    // $("#success-alert").fadeTo(2000, 500).slideUp(500, function() {
    //     $("#success-alert").slideUp(500);
    // });

}

/**
 * Handles options html form with selection
 *
 * @param {String} default_value - Default value.
 * @param {String} current_value - Current vale.
 * @param {Boolean} select_bool - Boolean to show if this is selected.
 */
function selected_option(default_value, current_value, select_bool) {
    if (default_value == current_value) {
        if (select_bool) {
            return 'selected';
        } else {
            return 'checked';
        }
    } else {
        return '';
    }
}

/**
 * Produce a single parameter
 *
 * @param {JSON} parameter -Parameter JSON.
 * @param {Boolean} repeatable - Boolean to show if this is repeatable.
 * @param {String} group_id - Group id this parameter belongs to.
 * @param {Boolean} refreshed - Refreshed boolean to show if the page was refreshed.
 */
function produce_one_parameter_form(parameter, repeatable, group_id, refreshed) {
    var form_html = [];
    var param = parameter['param'];
    var param_name = parameter['so:name'];
    var display_name = param_name;
    if (display_name == undefined) {
        display_name = param;
    }
    var grassroots_type = parameter['grassroots_type'];
    var level = parameter['level'];
    var type = parameter['type'];
    var description = parameter['so:description'];
    var current_value = '';
    var default_value = '';
    var group = "none";
    var refresh = false;

    var required = '';
    var required_param_name = '';

    //  check for exceptions to handle "PE Name" and "PE Email"
    var isException = (param === "PE Name" || param === "PE Email");

    if (parameter['required'] && !isException) {
       required = 'required';
       required_param_name = '*';
    }



    var counter = '';
    if (parameter['group'] !== undefined) {
        if (repeatable) {
            counter = repeatable_groups[group_id]['counter'];
            group = group_id + '^' + counter;
        }
    }
    if (parameter['refresh'] !== undefined) {
        refresh = parameter['refresh'];
    }

    if (grassroots_type == "params:directory") {
        if (parameter['current_value'] != undefined) {
            current_value = parameter['current_value']['value'];
        }
        if (default_value != undefined) {
            default_value = parameter['default_value']['value'];
        }
    } else {
        if (parameter['current_value'] != undefined) {
            current_value = parameter['current_value'];
        }
        if (parameter['default_value'] != undefined) {
            default_value = parameter['default_value'];
        }
        if (parameter['default_value'] != undefined && (grassroots_type == "params:unsigned_integer" || grassroots_type == "xsd:double")) {
            default_value = parseFloat(parameter['default_value'].toFixed(3));
        }
    }

    if (parameter['enum'] == undefined) {
        // boolean checkbox
        if (grassroots_type == "xsd:boolean") {
            // form_html.push('<div class="form-group">');
            // form_html.push('<label title="' + description + '">' + display_name + '</label>');
            // form_html.push('<label class="radio-inline">');
            // form_html.push(' <input type="radio" name="' + param + '^' + grassroots_type + '^' + type + '^' + group + '" id="' + param + 'true" value="true" ' + selected_option(default_value, true, false) + '> True');
            // form_html.push('</label>');
            // form_html.push('<label class="radio-inline">');
            // form_html.push(' <input type="radio" name="' + param + '^' + grassroots_type + '^' + type + '^' + group + '" id="' + param + 'false" value="false" ' + selected_option(default_value, false, false) + '> False');
            // form_html.push('</label>');
            // form_html.push('</div>');
            form_html.push('<div class="form-check ' + level + '">');
            form_html.push('<label class="form-check-label"  title="' + description + '">');
            form_html.push(' <input type="checkbox" name="' + param + '^' + grassroots_type + '^' + type + '^' + group + '" id="' + param.replace(/\s+/g, "_") + 'true" value="true" ' + selected_option(default_value, true, false) + '> ');
            // form_html.push(display_name + ' <small>' + description + '</small>');
            form_html.push(display_name);
            form_html.push('</label>');
            form_html.push('</div>');


        }
        // input form integer
        else if (grassroots_type == "params:signed_integer" || grassroots_type == "params:unsigned_integer" || grassroots_type == "params:negative_integer" || grassroots_type == "params:unsigned_number") {

            form_html.push('<div class="form-group ' + level + '">');
            form_html.push('<label title="' + description + '">' + display_name + required_param_name + '</label>');
            form_html.push('<input type="number" class="form-control ' + required + '"  name="' + param + '^' + grassroots_type + '^' + type + '^' + group + '" id="' + param.replace(/\s+/g, "_") + '" value="' + default_value + '" ' + required + '/>');
            form_html.push('</div>');

        }
        // input form float
        else if (grassroots_type == "params:unsigned_integer" || grassroots_type == "xsd:double") {

            form_html.push('<div class="form-group ' + level + '">');
            form_html.push('<label title="' + description + '">' + display_name + required_param_name + '</label>');
            form_html.push('<input type="number" class="form-control ' + required + '"  name="' + param + '^' + grassroots_type + '^' + type + '^' + group + '" id="' + param.replace(/\s+/g, "_") + '" value="' + default_value + '" ' + required + '/>');
            form_html.push('</div>');

        }
        // input form text
        else if (grassroots_type == "xsd:string"
            || grassroots_type == "params:character" || grassroots_type == "params:keyword") {
            form_html.push('<div class="form-group ' + level + '">');
            form_html.push('<label title="' + description + '">' + display_name + required_param_name + '</label>');
            form_html.push('<input type="text" class="form-control ' + required + '"  name="' + param + '^' + grassroots_type + '^' + type + '^' + group + '" id="' + param.replace(/\s+/g, "_") + '" value="' + default_value + '" ' + required + '/>');
            form_html.push('</div>');
        }
        // textarea
        else if (grassroots_type == "params:large_string") {
            form_html.push('<div class="form-group ' + level + '">');
            form_html.push('<label title="' + description + '">' + display_name + required_param_name + '</label>');
            form_html.push('<textarea class="form-control ' + required + '" name="' + param + '^' + grassroots_type + '^' + type + '^' + group + '" id="' + param.replace(/\s+/g, "_") + '" rows="3" ' + required + '>' + default_value + '</textarea>');
            form_html.push('</div>');
            textareas.push(param.replace(/\s+/g, "_"));

        }
        //json textarae
        else if (grassroots_type == "params:json") {
            form_html.push('<div class="form-group ' + level + '">');
            form_html.push('<label title="' + description + '">' + display_name + required_param_name + '</label>');
            form_html.push('<textarea class="form-control ' + required + '" name="' + param + '^' + grassroots_type + '^' + type + '^' + group + '" id="' + param.replace(/\s+/g, "_") + '" rows="3" ' + required + '>' + JSON.stringify(default_value) + '</textarea>');
            form_html.push('</div>');
            textareas.push(param.replace(/\s+/g, "_"));

        }
        //fasta (textarea)
        else if (grassroots_type == "params:fasta") {
            form_html.push('<div class="form-group ' + level + '">');
            form_html.push('<label title="' + description + '">' + display_name + required_param_name + '</label>');
            form_html.push('<textarea class="form-control ' + required + '" name="' + param + '^' + grassroots_type + '^' + type + '^' + group + '" id="' + param.replace(/\s+/g, "_") + '" rows="6" data-fasta required>' + default_value + '</textarea>');
            form_html.push('<div class="help-block with-errors">FASTA format required</div>');
            form_html.push('</div>');
            textareas.push(param.replace(/\s+/g, "_"));

        }
        //file
        else if (grassroots_type == "params:input_filename" || grassroots_type == "params:output_filename") {
            // form_html.push('<div class="form-group '+level+'">');
            // form_html.push('<label title="' + description + '">' + display_name + '</label>');
            // form_html.push('<input type="file" name="' + param + '^' + grassroots_type + '^' + type + '^' + group + '" id="' + param + '^' + grassroots_type + '" />');
            // form_html.push('</div>');

            //form_html.push('<div id="' + param + '^' + grassroots_type + 'drop" class="dropzone">Drop file here</div>');
            //form_html.push('<input type="hidden" name="' + param + '^' + grassroots_type + '^' + group + '" id="' + param + '^' + grassroots_type + '" />');
        }
        // password
        else if (grassroots_type == "params:password") {
            form_html.push('<div class="form-group ' + level + '">');
            form_html.push('<label title="' + description + '">' + display_name + required_param_name + '</label>');
            form_html.push('<input type="password" class="form-control ' + required + '"  name="' + param + '^' + grassroots_type + '^' + type + '^' + group + '" id="' + param.replace(/\s+/g, "_") + '^' + grassroots_type + '" value="' + default_value + '" ' + required + '/>');
            form_html.push('</div>');
        }
        // directory
        else if (grassroots_type == "params:directory") {
            form_html.push('<div class="form-group ' + level + '">');
            form_html.push('<label title="' + description + '">' + display_name + required_param_name + '</label>');
            form_html.push('<input type="password" class="form-control ' + required + '"  name="' + param + '^' + grassroots_type + '^' + type + '^' + group + '" id="' + param.replace(/\s+/g, "_") + '^' + grassroots_type + '" value="' + default_value + '" ' + required + '/>');
            form_html.push('</div>');
        }
        // date
        else if (grassroots_type == "xsd:date") {
            form_html.push('<div class="form-group ' + level + '">');
            form_html.push('<label title="' + description + '">' + display_name + required_param_name + '</label>');
            form_html.push('<input  type="text" class="datepicker form-control ' + required + '"  name="' + param + '^' + grassroots_type + '^' + type + '^' + group + '" id="' + param.replace(/\s+/g, "_") + '" value="' + default_value + '" ' + required + '/>');
            form_html.push('</div>');
        }
        // tabular
        else if (grassroots_type == "params:tabular" || grassroots_type == "params:json_array") {
            var cHeading = parameter['store']['Column Headings']; //uncomment. needed 
            var each_table_obj = {};
            var table_id = param.replace(/ /g, "_");
            var display_style = '';

            console.log('refreshed' + refreshed);
            if (repeatable) {
                display_style = ' style="display:none;"';
                if (!refreshed) {
                    console.log('refreshed' + refreshed);
                    table_id = param.replace(/ /g, "_") + '-' + counter;
                }
            }
            console.log('table id' + table_id);
            var current_table_value = [];

            each_table_obj['table_id'] = table_id;
            each_table_obj['cHeadings'] = cHeading;  //uncomment. needed 
            // if (!refreshed) {
            datatable_param_list.push(each_table_obj);
            // }
            form_html.push('<hr/><div class="form-group ' + level + '" style="margin: 20px 0px;">');
            form_html.push('<label title="' + description + '">' + display_name + '</label><br/>');

            form_html.push('<div class="sheet-drop" id="' + table_id + ':drop" ' + display_style + '>Drop a spreadsheet file here to populate the table below</div>');
            form_html.push('<label id="' + table_id + 'dropstatus" ' + display_style + '></label><br/>');

            form_html.push('<table id="' + table_id + '" class="display datatable_param">');
            ///################# 2023 removing editing from submit plot service ######################
            if (selected_service_name !== 'field_trial-submit_plots'){   // DAN 2023 do not show header for field_trial-submit_plots
                form_html.push('<thead id="' + table_id + 'thead" >');            		        
		        console.log("one parameter_form: ",parameter);	
                form_html.push(table_thead_formatter(cHeading));  //2023 NEEDED!! MANAGER SERVICE
		
                form_html.push('</thead>');
                    // form_html.push('<label title="' + description + '">' + display_name + '</label>');
                    // form_html.push('<input  type="text" class=" form-control"  name="' + param + '^' + grassroots_type + '^' + type + '^' + group + '" id="' + param + '" value="' + default_value + '"/>');

                if (parameter['current_value'] != undefined) {
                    current_table_value = parameter['current_value'];
                    if (parameter['current_value'].length > 0 && table_id !== 'PL_Upload') {
                    // *-*    form_html.push(table_body_formatter(cHeading, current_table_value, param, repeatable, counter, refreshed)); // TEST parameters error.
                       form_html.push(table_body_formatter(cHeading, current_table_value, param, repeatable, counter, refreshed));
                    }
                }
            }   
            ///################# 2023 removing editing from submit plot service ######################
            form_html.push('</table>');
            form_html.push('</div><hr/>');
        }
    }
    //select with options
    else {
        var outfmt_html = [];
        var enums = parameter['enum'];
        form_html.push('<div class="form-group ' + level + '">');
        form_html.push('<label title="' + description + '">' + display_name + '</label>');
        if (refresh) {
            form_html.push('<select class="form-control" name="' + param + '^' + grassroots_type + '^' + type + '^' + group + '" id="' + param + '^' + grassroots_type + '" onchange="refresh_service(this);">');
        } else {
            form_html.push('<select class="form-control" name="' + param + '^' + grassroots_type + '^' + type + '^' + group + '" id="' + param + '^' + grassroots_type + '">');
        }
        for (var j = 0; j < enums.length; j++) {
            var this_enum = enums[j];
            var option_text = this_enum['so:description'];
            if (this_enum['so:description'] == undefined) {
                option_text = this_enum['value']
            }
            form_html.push('<option value="' + this_enum['value'] + '" ' + selected_option(default_value, this_enum['value'], true) + '>' + option_text + '</option>');
            outfmt_html.push('<option value="' + this_enum['value'] + '">' + option_text + '</option>');
        }

        if ((selected_service_name === service_blastn || selected_service_name === service_blastp || selected_service_name === service_blastx) && param === 'outfmt') {
            $('#output_format').html(outfmt_html.join(' '));
        }
        form_html.push('</select>');
        form_html.push('</div>');

    }
    return form_html.join(' ');
}

/**
 * Refresh the whole service, triggered by a refreshable parameter
 *
 * @param {String} input - Parameter input.
 */
function refresh_service(input) {
    // console.log(input);

    $('#status').html('<img src="' + root_dir + 'static/images/ajax-loader.gif"/>');
    Utils.ui.disableButton('submit_button');
    var form = jQuery('#form').serializeArray();
    form = form.concat(
        jQuery('#form input[type=checkbox]:not(:checked)').map(
            function () {
                return {"name": this.name, "value": "false"}
            }).get()
    );
    var submission = {};
    var submit_job = {};
    var parameters = [];
    var services_array = [];
    var parameter_set = {};


    parameters = construct_parameters(form);

    // for (var idt = 0; idt < datatable_param_list.length; idt++) {
    //
    //     var parameter = {};
    //     var datatableId = datatable_param_list[idt]['table_id'];
    //     var this_table_array = [];
    //     var current_value_array = [];
    //     var real_param = datatableId.replace(/_/g, " ");
    //     parameter['param'] = real_param;
    //     var this_table = $('#' + datatableId).DataTable();
    //     this_table_array = this_table.$('input, select').serializeArray();
    //     var row_length = this_table.rows().count();
    //     for (var rowsi = 0; rowsi < row_length; rowsi++) {
    //         var row_object = {};
    //         for (var ttai = 0; ttai < this_table_array.length; ttai++) {
    //             var name = this_table_array[ttai]['name'].split('^');
    //             var column_name = name[3];
    //             if (name[2] == rowsi) {
    //                 row_object[column_name] = this_table_array[ttai]['value'];
    //             }
    //
    //         }
    //         current_value_array.push(row_object);
    //         console.log(JSON.stringify(current_value_array));
    //     }
    //     parameter['current_value'] = current_value_array;
    //     parameters.push(parameter);
    //
    // }
    //
    // for (var i = 0; i < form.length; i++) {
    //     var name = form[i]['name'].split('^');
    //     if (name[0] === 'tabular') {
    //         //do nothing? DataTable().serializeArray() takes over
    //     } else {
    //         var param = name[0];
    //         var grassroots_type = name[1];
    //         var type = name[2];
    //         var group = name[3];
    //         var value = form[i]['value'];
    //         if (form[i]['value'] === ""){
    //             value = null;
    //         }
    //         var parameter = {};
    //         parameter['param'] = param;
    //         if (param === 'FT Facet') {
    //             fieldTrailSearchType = value;
    //         }
    //         // parameter['grassroots_type'] = grassroots_type;
    //         if (group != 'none') {
    //             if (name[4] == 0) {
    //                 parameter['group'] = repeatable_groups[group]['group'];
    //             } else {
    //                 parameter['group'] = repeatable_groups[group]['group'] + ' [' + name[4] + ']';
    //             }
    //         }
    //
    //         if (type == 'boolean') {
    //             parameter['current_value'] = JSON.parse(value);
    //         } else if (type == 'integer') {
    //             parameter['current_value'] = parseInt(value);
    //         } else if (type == 'number') {
    //             parameter['current_value'] = parseFloat(value);
    //         } else {
    //             parameter['current_value'] = value;
    //         }
    //         parameters.push(parameter);
    //     }
    // }

    submit_job['refresh_service'] = true;
    submit_job['so:alternateName'] = selected_service_name;

    parameter_set['level'] = level_simpleoradvanced;
    parameter_set['parameters'] = parameters;
    submit_job['parameter_set'] = parameter_set;

    services_array.push(submit_job);
    submission['services'] = services_array;


    console.info(JSON.stringify(submission));
    $.ajax({
        url: root_dir + "service/" + publicOrPrivate + "ajax/interact_backend/",
        type: "POST",
        headers: {
            'X-CSRFToken': csrftoken
        },
        data: JSON.stringify(submission),
        dataType: "json",
        success: function (json) {
            // do update values instead
            console.info(JSON.stringify(json));
            // for (var idt = 0; idt < datatable_param_list.length; idt++) {
            //     var datatableId = datatable_param_list[idt]['table_id'];
            //     $('#'+datatableId).DataTable().destroy();
            // }
            if (json['services'] !== undefined) {
                if (json['services'].length > 0) {
                    populate_page_with_json(json, true);
                }
            }

            $('#status').html('');
            Utils.ui.reenableButton('submit_button', 'Submit');
        }
    });


}

//
//
// function refresh_form_with_result(json) {
//     parameters = json['services'][0]['operation']['parameter_set']['parameters'];
//     groups = json['services'][0]['operation']['parameter_set']['groups'];
//     // refreshed = true;
//     produce_form('form', parameters, groups, true);
//
// }


/**
 * Check the number is odd
 *
 * @param {Int} n - Number input.
 */
function isOdd(n) {
    return Math.abs(n % 2) == 1;
}

/**
 * Ajax search services for searching Treatments and Measured Variables
 *
 * @param {String} type - Define Treatments or Measured Variables.
 */
function do_ajax_search(type) {
    var input = $('#ft_ajax_search').val();

    var input_tail = "";

    if (isOdd((input.match(/\"/g) || []).length)) {
        input_tail = "\"";
    }
    if (((input.match(/\"/g) || []).length) == 0) {
        input_tail = "*";
    }

    console.log(input_tail);

    if (input.length > 1) {

        $('#ajax_result').html('Searching...');
        var timer;

				/*
        var submit_json = {
            "services": [
                {
                    "start_service": true,
                    "so:name": "Search Field Trials",
                    "parameter_set": {
                        "level": "simple",
                        "parameters": [

                            {
                                "param": "FT Keyword Search",
                                "current_value": input + input_tail
                            },
                            {
                                "param": "FT Facet",
                                "current_value": type
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
        };
				*/

        var submit_json = {
            "services": [
                {
                    "start_service": true,
                    "so:name": "Search Grassroots",
                    "parameter_set": {
                        "level": "simple",
                        "parameters": [

                            {
                                "param": "SS Keyword Search",
                                "current_value": input + input_tail
                            },
                            {
                                "param": "SS Facet",
                                "current_value": type
                            },
                                      ]
                    }
                }
            ]
        };

        console.log(JSON.stringify(submit_json));

        clearTimeout(timer);

        timer = setTimeout(function () {
            $.ajax({
                url: root_dir + "service/ajax/interact_backend/",
                type: "POST",
                headers: {
                    'X-CSRFToken': csrftoken
                },
                data: JSON.stringify(submit_json),
                dataType: "json",
                success: function (json) {
                    var result_array = json['results'][0]['results'];
                    if (result_array == undefined) {
                        $('#ajax_result').html("No result found");
                    } else {
                        $('#ajax_result').html(format_treatment_ajax_result(result_array, type));
                        if (type === 'Measured Variable') {
                            var datatable = $('#treatment_result').DataTable({
                                "searching": false,
                                "aaSorting": [],
                                dom: 'lBfrtip',
                                buttons: [
                                    {
                                        extend: 'copyHtml5',
                                        title: null,
                                        messageTop: null,
                                        messageBottom: null,
                                        header: false,
                                        exportOptions: {
                                            columns: [8]
                                        }
                                    },
                                    {
                                        extend: 'csvHtml5',
                                        title: null,
                                        messageTop: null,
                                        messageBottom: null,
                                        header: false,
                                        exportOptions: {
                                            columns: [8]
                                        }
                                    },
                                    {
                                        extend: 'excelHtml5',
                                        title: null,
                                        messageTop: null,
                                        messageBottom: null,
                                        header: false,
                                        exportOptions: {
                                            columns: [8]
                                        }
                                    }
                                ],
                                select: true
                            });
                        } else if (type === 'Treatment') {
                            var datatable = $('#treatments_result').DataTable({
                                "searching": false,
                                "aaSorting": [],
                                dom: 'lBfrtip',
                                buttons: [
                                    {
                                        extend: 'copyHtml5',
                                        title: null,
                                        messageTop: null,
                                        messageBottom: null,
                                        header: false,
                                        exportOptions: {
                                            columns: [1]
                                        }
                                    },
                                    {
                                        extend: 'csvHtml5',
                                        title: null,
                                        messageTop: null,
                                        messageBottom: null,
                                        header: false,
                                        exportOptions: {
                                            columns: [1]
                                        }
                                    },
                                    {
                                        extend: 'excelHtml5',
                                        title: null,
                                        messageTop: null,
                                        messageBottom: null,
                                        header: false,
                                        exportOptions: {
                                            columns: [1]
                                        }
                                    }
                                ],
                                select: true
                            });
                        }
                        simpleOrAdvanced(get_simpleOrAdvanced());
                        //
                        // $('#treatment_result tbody').on('click', 'tr', function () {
                        //     var data = datatable.row(this).data();
                        //     copyToClipboard(data[8]);
                        //     $('#message').show();
                        //     $('#message').animate({opacity: 1.0}, 500).fadeOut();
                        //     console.log(data);
                        // });

                    }
                }
            });
        }, 0);
    } else {
        $('#ajax_result').html('Enter a longer search query.');
    }

}

/**
 * Copy text to clipboard
 *
 * @param {String} text - Text to be copied.
 */
function copyToClipboard(text) {

    var textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);

    textArea.select();

    try {
        var successful = document.execCommand('copy');
        var msg = successful ? 'successful' : 'unsuccessful';
        console.log('Copying text command was ' + msg);
    } catch (err) {
        console.log('Oops, unable to copy');
    }

    document.body.removeChild(textArea);
}

/**
 * Format result for searching Treatments and Measured Variables
 *
 * @param {JSONArray} array - Result array from backend.
 * @param {String} type - Define Treatments or Measured Variables.
 */
function format_treatment_ajax_result(array, type) {
    var html = [];
    console.log(JSON.stringify(array));
    if (type === 'Measured Variable') {

        html.push('<table class="display" id="treatment_result" style="font-size: 0.8em;" width="100%">');
        html.push('<thead>');
        html.push('<tr>');
        html.push('<th>Trait name</th>');
        html.push('<th>Trait Ontology</th>');
        html.push('<th>Trait Description</th>');
        html.push('<th>Trait Abbreviation</th>');
        html.push('<th>Measurement Name</th>');
        html.push('<th>Measurement Ontology</th>');
        html.push('<th>Unit Name</th>');
        html.push('<th>Unit Ontology</th>');
        html.push('<th>Variable Name</th>');
        html.push('<th>Variable Ontology</th>');
        html.push('<th>Variable Date</th>');
        html.push('<th>Variable Corrected</th>');
        html.push('</tr>');
        html.push('</thead>');


        html.push('<tbody>');
        for (var i = 0; i < array.length; i++) {
            if (array[i]['data']['@type'] === 'Grassroots:MeasuredVariable') {
                var trait = array[i]['data']['trait'];
                var measurement = array[i]['data']['measurement'];
                var unit = array[i]['data']['unit'];
                var variable = array[i]['data']['variable'];
                html.push('<tr>');
                html.push('<td>');
                html.push(trait['so:name']);
                html.push('</td>');
                html.push('<td>');
                html.push(trait['so:sameAs']);
                html.push('</td>');
                html.push('<td>');
                html.push(trait['so:description']);
                html.push('</td>');
                html.push('<td>');
                html.push(trait['abbreviation']);
                html.push('</td>');
                html.push('<td>');
                html.push(measurement['so:name']);
                html.push('</td>');
                html.push('<td>');
                html.push(measurement['so:sameAs']);
                html.push('</td>');
                html.push('<td>');
                html.push(unit['so:name']);
                html.push('</td>');
                html.push('<td>');
                html.push(unit['so:sameAs']);
                html.push('</td>');
                html.push('<td>');
                html.push(variable['so:name']);
                if (variable['so:sameAs'].startsWith('CO')) {
                    html.push('<br><img src="https://grassroots.tools/images/crop_ontology_logo_2.png" style="width: 70%;">');
                  }
                html.push('</td>');
                html.push('<td>');
                html.push(variable['so:sameAs']);
                html.push('</td>');
                html.push('<td>');
                html.push(variable['so:name'] + ' date');
                html.push('</td>');
                html.push('<td>');
                html.push(variable['so:name'] + ' corrected');
                html.push('</td>');
                html.push('</tr>');
            }
        }
        html.push('</tbody>');
        html.push('</table>');

    } else if (type === 'Treatment') {
        html.push('<table class="display" id="treatments_result" style="font-size: 0.8em;" width="100%">');
        html.push('<thead>');
        html.push('<tr>');
        html.push('<th>Treatment name</th>');
        html.push('<th>Treatment Ontology</th>');
        html.push('<th>Ontology Link</th>');
        html.push('<th>Treatment Description</th>');
        html.push('</tr>');
        html.push('</thead>');


        html.push('<tbody>');
        for (var i = 0; i < array.length; i++) {
            if (array[i]['data']['@type'] === 'Grassroots:Treatment') {
                let ontology = array[i]['data']['so:sameAs'];
                html.push('<tr>');
                html.push('<td>');
                html.push(array[i]['data']['so:name']);
                html.push('</td>');
                html.push('<td>');
                html.push(ontology);
                html.push('</td>');
                html.push('<td>');
                html.push('<a class="newstyle_link" target="_blank" href="https://browser.planteome.org/amigo/term/' + ontology + '">https://browser.planteome.org/amigo/term/' + ontology + '</a>');
                html.push('</td>');
                html.push('<td>');
                html.push(array[i]['data']['so:description']);
                html.push('</td>');
                html.push('</tr>');
            }
        }
        html.push('</tbody>');
        html.push('</table>');
    }
    return html.join(' ');
}

/**
 * For tabular parameter, format table headings with cHeadings JSONArray
 *
 * @param {JSONArray} cHeadings - Column array from backend.
 */
function table_thead_formatter(cHeadings) {
    var thead_html = [];
    // thead_html.push('<thead>');
    thead_html.push('<tr>');
    // Column Headings : "[ { "param": "Accession","so:description": "Sowing d", "required": true,  "type": "xsd:string" }, { "param": "Trait Identifier", "type": "xsd:string" }, { "param": "Trait Abbreviation", "type": "xsd:string" }, { "param": "Trait Name", "type": "xsd:string" }, { "param": "Trait Description", "type": "xsd:string" }, { "param": "Method Identifier", "type": "xsd:string" }, { "param": "Method Abbreviation", "type": "xsd:string" }, { "param": "Method Name", "type": "xsd:string" }, { "param": "Method Description", "type": "xsd:string" }, { "param": "Unit Identifier", "type": "xsd:string" }, { "param": "Unit Abbreviation", "type": "xsd:string" }, { "param": "Unit Name", "type": "xsd:string" }, { "param": "Unit Description", "type": "xsd:string" }, { "param": "Form Identifier", "type": "xsd:string" }, { "param": "Form Abbreviation", "type": "xsd:string" }, { "param": "Form Name", "type": "xsd:string" }, { "param": "Form Description", "type": "xsd:string" } ]"
    for (var i = 0; i < cHeadings.length; i++) {
        var required = '';
        if (cHeadings[i]['required'] != undefined) {
            if (cHeadings[i]['required']) {
                required = '*';
            }
        }
        thead_html.push('<th title="' + SafePrint(cHeadings[i]['so:description']) + '">' + cHeadings[i]['param'] + required + '</th>');
    }
    thead_html.push('</tr>');
    // thead_html.push('</thead>');
    return thead_html.join(' ');
}

/**
 * For tabular parameter, format table body
 *
 * @param {JSONArray} cHeadings - Column array from backend.
 * @param {JSONArray} tbody_values - Values array from backend.
 * @param {String} real_param - Original parameter name.
 * @param {Boolean} repeatable - Boolean to show if this is repeated.
 * @param {Int} counter - Repeat counter.
 * @param {Boolean} refreshed - Boolean to show if this was refreshed.
 */
function table_body_formatter(cHeadings, tbody_values, real_param, repeatable, counter, refreshed) {
    var tbody_html = [];
    tbody_html.push('<tbody>');
    if (repeatable && !refreshed) {
        real_param = real_param + '-' + counter;
    }
    for (var i = 0; i < tbody_values.length; i++) {

        tbody_html.push('<tr>');
        var row_json = tbody_values[i];
        var row_index = i;
        for (var j = 0; j < cHeadings.length; j++) {
            var column_param = cHeadings[j]['param'];
            var column_grassroots_type = cHeadings[j]['type'];
            var sheet_value = '';

            var required = '';
            if (cHeadings[j]['required'] != undefined) {
                if (cHeadings[j]['required']) {
                    required = 'required';
                }
            }
            //row_json[column_param];
            if (row_json[column_param] !== undefined) {
                sheet_value = row_json[column_param];
            }
            tbody_html.push('<td><input type="text" name="tabular^' + real_param + '^' + row_index + '^' + column_param + '^' + column_grassroots_type + '" value="' + sheet_value + '" ' + required + '/></td>');
        }
        tbody_html.push('</tr>');
    }
    tbody_html.push('</tbody>');
    return tbody_html.join(' ');
}

/**
 * For tabular parameter, add one row
 *
 * @param {string} table_id_drop - Table id with ^drop.
 * @param {JSON} json - Row data.
 */
function table_add_rows(table_id_drop, json) {
    var name = table_id_drop.split('^');
    var table_id = name[0];

    var t = $('#' + table_id).DataTable();
    var row_index = t.rows().count();

    for (var rs = 1; rs < json.length; rs++) {
        t.row.add(json[rs]);
    }
    t.draw(false)
    console.log(row_index);
    if (row_index == 1) {
        console.log('deleting first row...');
        t.row(0).remove().draw();
    }

}

/**
 * For tabular parameter, add one row with csv
 *
 * @param {string} table_id_drop - Table id with ^drop.
 * @param {String} csv - Row data in csv.
 */
function table_add_rows_csv(table_id_drop, csv) {

    $('#' + table_id + 'dropstatus').html('Processing...');
    var json = CSVJSON.csv2json(csv, {});
    console.log(JSON.stringify(json));
    var name = table_id_drop.split(':');
    var table_id = name[0];

    var t = $('#' + table_id).DataTable();
    var row_index = t.rows().count();


    console.log(row_index);
    if (row_index == 1) {
        console.log('deleting first row...');
        t.row(0).remove().draw();
        row_index = 0;
    }


    var cHeadings = [];
    for (var i = 0; i < datatable_param_list.length; i++) {
        if (datatable_param_list[i]['table_id'] === table_id) {
            cHeadings = datatable_param_list[i]['cHeadings'];
            console.log(datatable_param_list[i]['table_id']);
        }
    }

    console.log(JSON.stringify(cHeadings));
    for (var rs = 0; rs < json.length; rs++) {
        $('#' + table_id + 'dropstatus').html('Processing row: ' + row_index);
        var sheet_row_json = json[rs];
        var row_array = [];
        var real_param = table_id.replace(/_/g, " ");
        // var required = '';
        for (var r = 0; r < cHeadings.length; r++) {
            // fix for * required columns
            // if (cHeadings[r]['required'] != undefined) {
            //     if (cHeadings[r]['required']) {
            //         required = '*';
            //     }
            // }
            var column_param = cHeadings[r]['param'];
            // + required;
            // var column_grassroots_type = cHeadings[r]['type'];
            var sheet_value = "";
            if (sheet_row_json[column_param] != undefined) {
                sheet_value = sheet_row_json[column_param];
            }
            // row_array.push('<input type="text" name="tabular^' + real_param + '^' + row_index + '^' + column_param + '^' + column_grassroots_type + '" value="' + sheet_value + '"/>');
            row_array.push('<input type="text" name="tabular^' + real_param + '^' + row_index + '^' + column_param + '" value="' + sheet_value + '"/>');

            console.log('<input type="text" name="tabular^' + real_param + '^' + row_index + '^' + column_param + '" value="' + sheet_value + '"/>');
        }
        // t.row.add(row_array).draw(false);
        t.row.add(row_array);
        row_index++;
    }
    t.draw(false);
    $('#' + table_id + 'dropstatus').html('<span style="color:red;">Processing done.</span>');
    alert('Excel Processing done, the table will not display the content due to the size.');

}

/**
 * For tabular parameter, add one empty row
 *
 * @param {string} table_id - Table id .
 */
function table_add_new_row(table_id) {
    var t = $('#' + table_id).DataTable();
    var row_index = t.rows().count();
    var cHeadings = [];
    for (var i = 0; i < datatable_param_list.length; i++) {
        if (datatable_param_list[i]['table_id'] === table_id) {
            cHeadings = datatable_param_list[i]['cHeadings'];
        }
    }
    console.log(cHeadings);
    var row_array = [];
    var real_param = table_id.replace(/_/g, " ");
    for (var r = 0; r < cHeadings.length; r++) {

        var required = '';
        if (cHeadings[r]['required'] != undefined) {
            if (cHeadings[r]['required']) {
                required = 'required';
            }
        }

        var column_param = cHeadings[r]['param'];
        var column_grassroots_type = cHeadings[r]['type'];
        // row_array.push('<input type="text"  name="tabular^' + real_param + '^' + row_index + '^' + column_param + '^' + column_grassroots_type + '" value="" ' + required + '/>');
        row_array.push('<input type="text"  name="tabular^' + real_param + '^' + row_index + '^' + column_param + '" value="" ' + required + '/>');
    }
    t.row.add(row_array).draw(false);
}

/**
 * Add treatment (renamed to measured variable) and show a message modal
 *
 * @param {string} table_id - Table id .
 */
function table_add_teatment_columns_modal(table_id) {
    $('#modal-body').html('<p><a href="https://grassroots.tools/public/service/field_trial-search_measured_variables" class="newstyle_link" target="_blank">Search Measured Variables</a> and paste below</p><input id="add_treatment" type="text" class="form-control"><br/><p>Note: current data in table will be wiped</p>');
    $('#modal-footer').html('<div class="modal-footer"><button type="button" class="btn btn-primary" onclick="table_add_teatment_columns(\'' + table_id + '\');">Add Measured Variables</button></div>');
    $('#treatmentModal').modal('show');
}

/**
 * Add treatment (renamed to measured variable) columns
 *
 * @param {string} table_id - Table id .
 */
function table_add_teatment_columns(table_id) {
    var column_name = $('#add_treatment').val();
    if (column_name === '') {
        $('#add_treatment').css({'background-color': '#ff4d4d'});
    } else {
        $('#treatmentModal').modal('hide');
        var t = $('#' + table_id).DataTable();
        var column_index = t.columns().count();
        var row_index = t.rows().count();
        var cHeadings = [];
        for (var i = 0; i < datatable_param_list.length; i++) {
            if (datatable_param_list[i]['table_id'] === table_id) {
                cHeadings = datatable_param_list[i]['cHeadings'];
            }
        }
        var row_array = [];
        var real_param = table_id.replace(/_/g, " ");

        cHeadings.push({"param": column_name, "type": "xsd:string"},
            {"param": column_name + " date", "type": "xsd:string"},
            {"param": column_name + " corrected", "type": "xsd:string"});

        var each_table_obj = {};

        each_table_obj['table_id'] = table_id;
        each_table_obj['cHeadings'] = cHeadings;
        datatable_param_list.push(each_table_obj);
        console.log(datatable_param_list);

        t.destroy();
        var table_heading_html = table_thead_formatter(cHeadings);
        $('#' + table_id + 'thead').html(table_heading_html);
        $('#' + table_id + '> tbody').remove();

        // var existing_rows = $('#' + table_id + '> tbody').find("tr");
        // $.each(existing_rows, function (i, v) {
        //    v.append("<td></td><td></td><td></td>");
        // });

        add_plot_datatable(table_id);
        table_add_new_row(table_id);
    }

}

/**
 * Add plots datatable
 *
 * @param {string} table_id - Table id .
 */
function add_plot_datatable(table_id) {

    // var cHeadings = [];
    // var columnDefsList = [];
    // for (var i = 0; i < datatable_param_list.length; i++) {
    //     if (datatable_param_list[i]['table_id'] === table_id) {
    //         cHeadings = datatable_param_list[i]['cHeadings'];
    //     }
    // }
    // for (var ci = 0; ci < cHeadings.length; ci++){
    //     columnDefsList.push(SafePrint(cHeadings[ci]['so:description']));
    // }
    var tdt = $('#' + table_id).DataTable({
        scrollX: true,
        "paging": false,
        "aaSorting": [],
        dom: 'lBfrtip',
        buttons: [
            {
                text: 'Add Row',
                className: 'btn btn-success new_row_button',
                action: function (e, dt, node, config) {
                    table_add_new_row(dt.table().node().id);
                }
            },
            {
                text: 'Add Measured Variables',
                className: 'btn btn-success new_row_button',
                action: function (e, dt, node, config) {
                    table_add_teatment_columns_modal(dt.table().node().id);
                }
            },
            $.extend(true, {}, buttonCommon, {
                extend: 'excelHtml5',
                className: 'btn btn-success new_row_button',
                titleAttr: 'Export to Excel',
                // text:'New Export',
                title: null,
                messageTop: null,
                messageBottom: null
            })
        ]
    });

    $('#' + table_id).on('change', 'input', function () {
        //Get the cell of the input
        var cell = $(this).closest('td');

        //update the input value
        $(this).attr('value', $(this).val());

        //invalidate the DT cache
        tdt.cell($(cell)).data($(cell).html()).invalidate().draw();

        var name = $(this).attr("name");
        if (name.includes('Accession')) {
            check_GRU_by_accession($(this).val(), name);
        }

    });
}

/**
 * Using the form input to determine if show simple or advanced parameters
 *
 */
function get_simpleOrAdvanced() {
    return $('input[name="simpleadvanced"]:checked').val();
}

/**
 * Set show simple or advanced parameters
 *
 * @param {string} string - show_simple or show_advanced.
 */
function simpleOrAdvanced(string) {
    if (selected_service_name === 'field_trial-search_measured_variables') {
        var treatment_table = $('#treatment_result').DataTable();
        if (string === 'show_simple') {
            treatment_table.column(1).visible(false);
            treatment_table.column(5).visible(false);
            treatment_table.column(7).visible(false);
            treatment_table.column(9).visible(false);
            treatment_table.column(10).visible(false);
            treatment_table.column(11).visible(false);
            level_simpleoradvanced = "simple";
        } else if (string === 'show_advanced') {
            treatment_table.column(1).visible(true);
            treatment_table.column(5).visible(true);
            treatment_table.column(7).visible(true);
            treatment_table.column(9).visible(true);
            level_simpleoradvanced = "advanced";
        }

    } else if (selected_service_name === 'field_trial-search_treatments') {
        var treatments_table = $('#treatments_result').DataTable();
        level_simpleoradvanced = "simple";

    } else {
        if (string === 'show_simple') {
            $('.advanced').hide();
            $('.simple').show();
            level_simpleoradvanced = "simple";

        } else if (string === 'show_advanced') {
            $('.simple').hide();
            $('.advanced').show();
            level_simpleoradvanced = "advanced";
        }
    }
}

/**
 * Submit the whole form to backend
 *
 */
function submit_form() {
    var all_parameter = $('input,textarea,select');
    // remove the error messages
    $('.popover').each(function () {
        $(this).remove();
    });
    // remove error parameters background colour
    all_parameter.each(function () {
        $(this).css({'background-color': ''});
    });

    var required = $('input,textarea,select').filter('[required]:visible');
    var allRequired = true;
    required.each(function () {
        if ($(this).val() == '') {
            $(this).css({'background-color': '#ff4d4d'});
            $(this).popover({
                content: 'Required field',
                placement: 'top',
                trigger: 'manual',
                animation: false
            }).popover('show');
            $(this).on('click', function () {
                $(this).popover('toggle');
            });
            allRequired = false;
        }
    });

    if (!allRequired) {
        alert('Please fill all required fields with *');
    } else {
        $('#status').html('<img src="' + root_dir + 'static/images/ajax-loader.gif"/>');
        Utils.ui.disableButton('submit_button');
        var form = jQuery('#form').serializeArray();
        form = form.concat(
            jQuery('#form input[type=checkbox]:not(:checked)').map(
                function () {
                    return {"name": this.name, "value": "false"}
                }).get()
        );
        var submission = {};
        var submit_job = {};
        var parameters = [];
        var services_array = [];
        var parameter_set = {};

        parameters = construct_parameters(form);

        submit_job['start_service'] = true;
        submit_job['so:alternateName'] = selected_service_name;

        parameter_set['level'] = level_simpleoradvanced;
        parameter_set['parameters'] = parameters;
        submit_job['parameter_set'] = parameter_set;

        services_array.push(submit_job);
        submission['services'] = services_array;


        console.info(JSON.stringify(submission));
        $.ajax({
            url: root_dir + "service/" + publicOrPrivate + "ajax/interact_backend/",
            type: "POST",
            headers: {
                'X-CSRFToken': csrftoken
            },
            data: JSON.stringify(submission),
            dataType: "json",
            success: function (json) {
                display_result(json);
                if (wizard_bool) {
                    wizard_count++;
                    $('#submit_button').val('Next Step');
                    $('#submit_button').click(function () {
                        var wizard_progress = wizard_count + 1;
                        window.location.href = 'fieldtrial_submission.html?step=' + wizard_progress;
                    });
                }
            }
        });
    }
}

/**
 * Construct parameters into JSON from HTML form, make the parameters: [] array
 *
 * @param {Form} form - html form.
 */
function construct_parameters(form) {
    var parameters = [];
    // not getting the sheet of plots from the form but from memory
    if (selected_service_name === 'field_trial-submit_plots') {
        var parameter = {};
        parameter['param'] = 'PL Upload';
        parameter['current_value'] = plots;
        parameters.push(parameter);
    } else {
        for (var idt = 0; idt < datatable_param_list.length; idt++) {

            var parameter = {};
            var datatableId = datatable_param_list[idt]['table_id'];
            var this_table_array = [];
            var current_value_array = [];
            var real_param = datatableId.replace(/_/g, " ");
            parameter['param'] = real_param;
            var this_table = $('#' + datatableId).DataTable();
            this_table_array = this_table.$('input, select').serializeArray();
            var row_length = this_table.rows().count();
            if (row_length > 0) {
                for (var rowsi = 0; rowsi < row_length; rowsi++) {
                    var row_object = {};
                    for (var ttai = 0; ttai < this_table_array.length; ttai++) {
                        var name = this_table_array[ttai]['name'].split('^');
                        var column_name = name[3];
                        if (name[2] == rowsi) {
                            row_object[column_name] = this_table_array[ttai]['value'];
                        }

                    }
                    current_value_array.push(row_object);
                    // console.log(JSON.stringify(current_value_array));
                }
            }

            parameter['current_value'] = current_value_array;
            parameters.push(parameter);

        }
    }

    for (var i = 0; i < form.length; i++) {
        var name = form[i]['name'].split('^');
        if (name[0] === 'tabular') {
            //do nothing above takes over
        } else {
            var param = name[0];
            var grassroots_type = name[1];
            var type = name[2];
            var group = name[3];
            var value = form[i]['value'];
            var modify = false; // new for correction
            if (form[i]['value'] === "") {
                value = null;
            }
            if (param === 'TF Name' && value === null) { // new for correction for editing study with no treatment factor
                modify=true;
                console.log("correct FT levels");
            }
            var parameter = {};
            parameter['param'] = param;
            if (param === 'FT Facet') {
                fieldTrailSearchType = value;
            }
            // parameter['grassroots_type'] = grassroots_type;
            if (group != 'none') {
                //     if (name[4] == 0) {
                parameter['group'] = repeatable_groups[group]['group'];
                //     } else {
                //         parameter['group'] = repeatable_groups[group]['group'] + ' [' + name[4] + ']';
                //     }
            }
            // if (value !== null) {
            if (type === 'boolean' || type === 'json') {
                parameter['current_value'] = JSON.parse(value);
            } else if (type === 'integer') {
                parameter['current_value'] = parseInt(value);
            } else if (type === 'number') {
                parameter['current_value'] = parseFloat(value);
            } else {
                parameter['current_value'] = value;
            }
            parameters.push(parameter);
        }
    }
    if (modify === true){
        for (var i = 0; i < parameters.length; i++) {
             console.log("correction------", parameters[i].param)
            if (parameters[i].param === "TF Levels-0") {
              //  console.log("correction------MATCH", parameters[i].param)
              parameters[i].current_value = [null];              
              break; // Stop iterating once the desired dictionary is found
            }
          }        
    }
    return process_repeatable_parameters(parameters);
}

/**
 * Process repeated parameters
 *
 * @param {JSONArray} input_parameters - all parameters.
 */
function process_repeatable_parameters(input_parameters) {
    let remove_indices = [];
    $.each(repeatable_groups, function (index, group) {
        for (var i = 0; i < group['parameters'].length; i++) {
            var repeat_paramater = group['parameters'][i];
            var repeat_param = repeat_paramater['param'];

            let new_parameter = {};
            new_parameter['param'] = repeat_param;
            let current_value = [];

            for (var pt = 0; pt < input_parameters.length; pt++) {
                let table_bool = false;
                if (repeat_paramater['grassroots_type'] === 'params:json_array' || repeat_paramater['grassroots_type'] === 'params:tabular') {
                    table_bool = true;
                }
                let input_parameter = input_parameters[pt];
                let input_param_name = input_parameter['param'];
                if (table_bool) {
                    let input_param_name_table = input_parameter['param'].split('-');
                    input_param_name = input_param_name_table[0];
                }

                // console.log(input_param_name);
                if (input_param_name === repeat_param) {
                    console.log(input_parameter['current_value']);

                    if (table_bool) {
                        if (input_parameter['current_value'].length > 0) {
                            current_value.push(input_parameter['current_value']);
                        }
                    } else {
                        current_value.push(input_parameter['current_value']);
                    }
                    // remove just added values from the list
                    remove_indices.push(pt);
                    // input_parameters.splice(pt, 1);
                }
            }
            new_parameter['current_value'] = current_value;
            input_parameters.push(new_parameter);
        }

    });
    remove_indices.sort();
    remove_indices.reverse();
    // console.log(remove_indices);
    for (var j = 0; j < remove_indices.length; j++) {
        input_parameters.splice(remove_indices[j], 1);
    }
    return input_parameters;
}

/**
 * Get result from a previous job id
 *
 * @param {String} service - Service name.
 * @param {String} previousID - Previous JOB id.
 */
function get_api_result(service, previousID) {
    selected_service_name = service;
    $('#title').html(service);
    $('#status').html('<img src="' + root_dir + 'static/images/ajax-loader.gif"/>');
    $.ajax({
        url: server_url + '/service/' + encodeURIComponent(service) + '?Previous%20results=' + previousID,
        // type: "GET",
        dataType: "json",
        cache: true,
        success: function (json) {
            var status_text_key = json['results'][0]['status_text'];
            if (status_text_key == 'Partially succeeded' || status_text_key == 'Succeeded') {
                display_result(json);
            } else {
                setTimeout(function () {
                    location.reload();
                }, 5000);
            }
        }
    });


}


/**
 * Display results from backend
 *
 * @param {JSON} json - Result JSON from backend.
 */
function display_result(json) {
    Utils.ui.reenableButton('submit_button', 'Submit');
    // response = json;
    console.info(JSON.stringify(json));
    //            if (synchronous){
    if (selected_service_name == service_blastn || selected_service_name == service_blastp || selected_service_name == service_blastx) {
        $('#status').html('');
        $('#result').html('');
        // get each job and place html
        for (var i = 0; i < json['results'].length; i++) {
            var each_result = json['results'][i];
            var uuid = each_result['job_uuid'];
            var dbname = each_result['so:name'];
            $('#result').append('<fieldset><legend>' + dbname + '</legend><div><p><b>Job ID: ' + uuid + '</b></p><div id=\"' + uuid + '\">Job Submitted <img src="' + root_dir + 'static/images/ajax-loader.gif"/></div></div></br></fieldset>');

            checkResult(each_result);
        }
        $('#output_format_div').show();
        changeDownloadFormat();
    } else if (selected_service_name == service_polymarker_search) {
        $('#status').html('');
        $('#result').html('');
        for (var i = 0; i < json['results'].length; i++) {
            var each_result = json['results'][i];
            var uuid = each_result['job_uuid'];
            var dbname = each_result['so:name'];
            $('#result').append('<fieldset><legend>' + dbname + '</legend><div><p><b>Job ID: ' + uuid + '</b></p><div id=\"' + uuid + '\">Job Submitted <img src="' + root_dir + 'static/images/ajax-loader.gif"/></div></div></br></fieldset>');

            checkResult(each_result);
        }

    } else if (selected_service_name == service_pathogenomics_geoservice) {
        $('#status').html('');
        $('#result').html(JSON.stringify(json['results'][0]['results'][0]['data']));
    } else if (selected_service_name == service_gru_seedbank_search) {
        $('#simpleAdvanceWrapper').hide();
        $('#status').html('');
        $('#form').html('');
        $('#tableWrapper').html('<table id="resultTable"></table>');
        // $('#result').html(JSON.stringify(json['results'][0]['results'][0]['data']));
        markersGroup = new L.MarkerClusterGroup({});
        map = L.map('map', {zoomControl: false}).setView([52.621615, 10.219470], 5);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>',
            maxZoom: 18
        }).addTo(map);

        L.control.zoom({position: 'topright'}).addTo(map);

        startGIS(json['results'][0]['results']);
        map.fitWorld({reset: true}).zoomIn();
    }
        //old field trial showing map directly
        // else if (selected_service_name == 'Search Field Trials') {
        //     $('#simpleAdvanceWrapper').hide();
        //     $('#status').html('');
        //     $('#form').html('');
        //     $('#tableWrapper').html('<table id="resultTable"></table>');
        //     // $('#result').html(JSON.stringify(json['results'][0]['results'][0]['data']));
        //     markersGroup2 = new L.MarkerClusterGroup({});
        //     map = L.map('map', {zoomControl: false}).setView([52.621615, 10.219470], 5);
        //
        //        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        //            attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>',
        //            maxZoom: 18
        //        }).addTo(map);
        //
        //     L.control.zoom({position: 'topright'}).addTo(map);
        //
        //     startFieldTrialGIS(json['results'][0]['results']);
    // }
    else if (selected_service_name == service_field_trial_search) {
        // $('#simpleAdvanceWrapper').hide();
        $('#status').html('');
        $('#map').remove();
        // $('#form').html('');
        $('#tableWrapper').html('<table class="display" id="resultTable" width="100%"></table>');
        var resultsList = json['results'][0]['results'];
        $('#resultTable').html(format_fieldtrial_result(resultsList));
        var datatable = $('#resultTable').DataTable({
            // "searching": false,
            "aaSorting": []
        });


    } else if (selected_service_name == field_trial_indexing) {
        $('#status').html('');
        var status_text_key = json['results'][0]['status_text'];
        if (status_text_key == 'Partially succeeded' || status_text_key == 'Succeeded') {
            var results = 'Done';
            if (json['results'][0]['results'] != undefined) {
                results = JSON.stringify(SafePrint_with_value(json['results'][0]['results'][0]['data'], 'Done'));
            }
            $('#status').html(results);
        } else {
            $('#status').html(status_text_key);
        }

    } else if (selected_service_name == grassroots_search) {
        $('#status').html('');
        var grassroots_search_html = [];
        var grassroots_search_tabs_ul = [];
        var facets = [];
        var status_text_key = json['results'][0]['status_text'];
        var tabs = false;
        var measured_variable_found = false;
        var treatment_found = false;
        if (status_text_key == 'Partially succeeded' || status_text_key == 'Succeeded') {
            if (json['results'][0]['metadata']['total_hits'] > 0) {
                facets = json['results'][0]['metadata']['facets'];
                var gs_results = json['results'][0]['results'];
                if (facets.length > 0) {
                    tabs = true;
                    grassroots_search_html.push('<div id="search_result_tabs" style="margin: 20px 0; border: 1px solid; padding: 10px;">');
                    grassroots_search_html.push('<ul>');
                    grassroots_search_html.push(format_grassroots_search_results_ul(facets));
                    grassroots_search_html.push('</ul>');

                    for (i = 0; i < facets.length; i++) {
                        var this_facet = facets[i];
                        var this_facet_count = this_facet['count'];
                        var this_facet_name = this_facet['so:name'];

                        // grassroots_search_html.push('<p>' + this_facet_name + ': ' + this_facet_count + ' result(s)<p>');

                        grassroots_search_html.push('<div id="' + this_facet_name.replace(/\s+/g, "_") + '"  style="overflow: auto;">');
                        if (this_facet_name === 'Measured Variable') {
                            measured_variable_found = true;
                            grassroots_search_html.push('<i>Measured Variables</i><br/>');
                            grassroots_search_html.push(format_treatment_ajax_result(gs_results, 'Measured Variable'));
                        } else if (this_facet_name === 'Treatment') {
                            treatment_found = true;
                            grassroots_search_html.push('<i>Treatment</i><br/>');
                            grassroots_search_html.push(format_treatment_ajax_result(gs_results, 'Treatment'));
                        } else {
                            grassroots_search_html.push('<table id="' + this_facet_name.replace(/\s+/g, "_") + '_list">');
                            grassroots_search_html.push('<thead><tr><th></th></tr>');
                            grassroots_search_html.push('</thead>');
                            grassroots_search_html.push('<tbody>');
                            for (j = 0; j < gs_results.length; j++) {
                                var this_result = gs_results[j];
                                var type_description = this_result['data']['type_description'];
                                if (this_facet_name === type_description) {
                                    grassroots_search_html.push('<tr><td>');
                                    grassroots_search_html.push(format_grassroots_search_result(this_result));
                                    grassroots_search_html.push('</td></tr>');

                                }
                            }
                            grassroots_search_html.push('</tbody>');
                            grassroots_search_html.push('</table>');

                        }
                        grassroots_search_html.push('</div>');
                    }

                    grassroots_search_html.push('</div>');
                }
            } else {
                grassroots_search_html.push('No result found');
            }
            $('#status').html(grassroots_search_html.join(' '));
            if (tabs) {
                $("#search_result_tabs").tabs();
            }
            if (measured_variable_found) {
                $('#treatment_result').DataTable({
                    "searching": false,
                    "aaSorting": [],
                    dom: 'lBfrtip',
                    buttons: [
                        {
                            extend: 'copyHtml5',
                            title: null,
                            messageTop: null,
                            messageBottom: null,
                            header: false,
                            exportOptions: {
                                columns: [8, 10, 11]
                            }
                        },
                        {
                            extend: 'csvHtml5',
                            title: null,
                            messageTop: null,
                            messageBottom: null,
                            header: false,
                            exportOptions: {
                                columns: [8, 10, 11]
                            }
                        },
                        {
                            extend: 'excelHtml5',
                            title: null,
                            messageTop: null,
                            messageBottom: null,
                            header: false,
                            exportOptions: {
                                columns: [8, 10, 11]
                            }
                        }
                    ],
                    select: true
                });
            }
            if (treatment_found) {
                $('#treatments_result').DataTable({
                    "searching": false,
                    "aaSorting": [],
                    dom: 'lBfrtip',
                    buttons: [
                        {
                            extend: 'copyHtml5',
                            title: null,
                            messageTop: null,
                            messageBottom: null,
                            header: false,
                            exportOptions: {
                                columns: [1]
                            }
                        },
                        {
                            extend: 'csvHtml5',
                            title: null,
                            messageTop: null,
                            messageBottom: null,
                            header: false,
                            exportOptions: {
                                columns: [1]
                            }
                        },
                        {
                            extend: 'excelHtml5',
                            title: null,
                            messageTop: null,
                            messageBottom: null,
                            header: false,
                            exportOptions: {
                                columns: [1]
                            }
                        }
                    ],
                    select: true
                });
            }


           if (facets.length > 0) { // new check for updated DATATABLES and jquery
                for (let i = 0; i < facets.length; i++) {
                let this_facet = facets[i];
                let this_facet_name = this_facet['so:name'];
                let safeId = '#' + this_facet_name.replace(/\s+/g, "_") + '_list';

                    // Checking and destroying existing DataTables
                if ($.fn.DataTable.isDataTable(safeId)) {
                $(safeId).DataTable().destroy();
                console.log("Destroyed existing DataTable for:", safeId);
                }

                // Initializing DataTables with a slight delay to ensure DOM is ready
                setTimeout(() => {
									// Make sure that the results section is visible
									$("#status").show ();
									
	                $(safeId).DataTable({
	                    "searching": false,
	                    "ordering": false,
	                    "lengthChange": false,
	                    "aaSorting": []
	                });
	                console.log("Initialized DataTable for:", safeId);
                }, 100); // Adjust timing if necessary
                }
            } 

        } else {
            $('#status').html(status_text_key);
        }

    }
     else if (selected_service_name === 'field_trial-submit_study') {
 	console.log((selected_service_name));
        $('#status').html('');
        var status_text_key = json['results'][0]['status_text'];
        if (status_text_key == 'Succeeded') {
            $('#result').html("Done");
            var url = json['results'][0]['so:url'];
            $('#url').html( 'See study: <a href="'+ url +' " target="_blank">'+ url  ); //new tag ID
            if (json['results'][0]['results'] !== undefined) {
                downloadFile(json['results'][0]['results'][0]['data'], selected_service_name);
            }
        } else if (status_text_key == 'Partially succeeded') {
            $('#result').html("Done, but with errors.");
            handle_errors(json['results'][0]);
        } else if (status_text_key == 'Failed' || status_text_key == 'Failed to start' || status_text_key == 'Error') {
            var general_error = get_general_errors(json['results'][0]);
            $('#result').html('Job ID: ' + json['results'][0]['job_uuid'] + ' ' + status_text_key + '<br/>  ' + general_error);
            handle_errors(json['results'][0]);
            Utils.ui.reenableButton('submit_button', 'Submit');
        }

    } 
     else if (selected_service_name === 'field_trial-submit_plots') {
 	console.log((selected_service_name));
        $('#status').html('');
        var status_text_key = json['results'][0]['status_text'];
        if (status_text_key == 'Succeeded') {
            $('#result').html("Done");
            handle_errors(json['results'][0]);//2023, show extra error still occur in sucessful submission
            var url = json['results'][0]['so:url'];
            $('#url').html( 'See plot table: <a href="'+ url +' " target="_blank">'+ url  ); //new tag ID
            if (json['results'][0]['results'] !== undefined) {
                downloadFile(json['results'][0]['results'][0]['data'], selected_service_name);
            }
        } else if (status_text_key == 'Partially succeeded') {
            $('#result').html("Done, but with errors.");
            handle_errors(json['results'][0]);
	    var url = json['results'][0]['so:url'];  // study submitted,  show url despite errors
            $('#url').html( 'See plot table: <a href="'+ url +' " target="_blank">'+ url  );//2023new tag
        } else if (status_text_key == 'Failed' || status_text_key == 'Failed to start' || status_text_key == 'Error') {
            var general_error = get_general_errors(json['results'][0]);
            $('#result').html('Job ID: ' + json['results'][0]['job_uuid'] + ' ' + status_text_key + '<br/>  ' + general_error);
            handle_errors(json['results'][0]);
            Utils.ui.reenableButton('submit_button', 'Submit');
        }

    }  


    // new services result can be added here
    else {
        $('#status').html('');
        var status_text_key = json['results'][0]['status_text'];
        if (status_text_key == 'Succeeded') {
            $('#result').html("Done");
            if (json['results'][0]['results'] !== undefined) {
                downloadFile(json['results'][0]['results'][0]['data'], selected_service_name);
            }
        } else if (status_text_key == 'Partially succeeded') {
            $('#result').html("Done, but with errors.");
            handle_errors(json['results'][0]);
        } else if (status_text_key == 'Failed' || status_text_key == 'Failed to start' || status_text_key == 'Error') {
            var general_error = get_general_errors(json['results'][0]);
            $('#result').html('Job ID: ' + json['results'][0]['job_uuid'] + ' ' + status_text_key + '<br/>  ' + general_error);
            handle_errors(json['results'][0]);
            Utils.ui.reenableButton('submit_button', 'Submit');
        }

    }
}

/**
 * Format search result tabs
 *
 * @param {JSON} facets - Facet result JSON from backend.
 */
function format_grassroots_search_results_ul(facets) {
    console.log(JSON.stringify(facets));
    var sorted_facets = sortResults(facets, 'so:name', true);
    var grassroots_search_html = [];
    for (i = 0; i < sorted_facets.length; i++) {
        var this_facet = sorted_facets[i];
        var this_facet_count = this_facet['count'];
        var this_facet_name = this_facet['so:name'];
        var result_name = 'result';
        if (this_facet_count > 1) {
            result_name = 'results';
        }
        grassroots_search_html.push('<li><a href="#' + this_facet_name.replace(/\s+/g, "_") + '">' + this_facet_name + ': ' + this_facet_count + ' ' + result_name + '</a></li>');
    }
    return grassroots_search_html.join(' ');

}

/**
 * Sort search result
 *
 * @param {JSONArray} arr - Facet result JSON from backend.
 * @param {String} prop - JSON property to sort.
 * @param {Boolean} asc - Boolean for ascending.
 */
function sortResults(arr, prop, asc) {
    arr.sort(function (a, b) {
        if (asc) {
            return (a[prop] > b[prop]) ? 1 : ((a[prop] < b[prop]) ? -1 : 0);
        } else {
            return (b[prop] > a[prop]) ? 1 : ((b[prop] < a[prop]) ? -1 : 0);
        }
    });
    return arr;
}

/**
 * Format one search result
 *
 * @param {JSON} this_result - A result JSON from backend.
 */
function format_grassroots_search_result(this_result) {

    var grassroots_search_html = [];

    var img_html = '';
    if (this_result['data']['so:image'] != undefined) {
        img_html = ' <img src="' + this_result['data']['so:image'] + '"/> ';
    }
    var title = this_result['title'];

    // if (this_result['data']['so:url'] != undefined) {
    //     var result_link = this_result['data']['so:url'];
    //     if (this_result['data']['@type'] == 'Grassroots:Service'){
    //         title = this_result['data']['service'];
    //         grassroots_search_html.push('<a style="color:#18bc9c ! important;" target="_blank" href="' + result_link + '"><i>' + img_html + ' ' + title + '</i></a>');
    //     }else{
    //         grassroots_search_html.push('<a style="color:#18bc9c ! important;" target="_blank" href="' + result_link + '"><i>' + img_html + ' ' + title + '</i></a>');
    //     }
    // } else {
    //     grassroots_search_html.push('<i>' + img_html + ' ' + title + '</i>');
    // }


    var json = this_result['data'];
    grassroots_search_html.push('<div>');

    if (json['@type'] == 'Grassroots:Study') {
        var study_id = json['id'];
        var study_name = json['so:name'];
        var desc = json['so:description'];
        grassroots_search_html.push(img_html + 'Grassroots Study: <a style="color:#18bc9c ! important;" href="' + root_dir + 'fieldtrial/study/' + study_id + '" target="_blank" >' + study_name + '</a>');
        grassroots_search_html.push('<br/>' + SafePrint(desc));
    } else if (json['@type'] == 'Grassroots:FieldTrial') {
        var ft_id = json['id'];
        var ft_name = json['so:name'];
        var desc = json['so:description'];
        grassroots_search_html.push(img_html + 'Grassroots Field Trial: <a style="color:#18bc9c ! important;" class="newstyle_link" href="' + root_dir + 'fieldtrial/' + ft_id + '" target="_blank" >' + ft_name + '</a>');
        grassroots_search_html.push('<br/>' + SafePrint(desc));
    } else if (json['@type'] == 'Grassroots:Service') {
        title = this_result['data']['service'];
        var service = json['so:name'];
        var description = json['so:description'];
        var payload_uri = encodeURIComponent(JSON.stringify(json['payload']));
        grassroots_search_html.push('<a style="color:#18bc9c ! important;" class="newstyle_link" href="' + root_dir + 'service/payload/' + payload_uri + '" target="_blank">' + img_html + ' ' + title + '</a><br/>');
        grassroots_search_html.push('<b>' + service + '</b><br/>');
        grassroots_search_html.push('' + description + '<br/>');
        //when alt name available need to make it dynamic
    } else if (json['@type'] == 'Grassroots:Project') {
        var author_list = json['authors'];
        var author = '';
        for (var i = 0; i < author_list.length; i++) {
            if (author === '') {
                author = author + ' ' + author_list[i];
            } else {
                author = author + ', ' + author_list[i];
            }
        }
        var description = json['so:description'];
        var url = json['so:url'];
        grassroots_search_html.push('<a style="color:#18bc9c ! important;" class="newstyle_link" href="' + url + '" target="_blank">' + img_html + ' ' + title + '</a><br/>');
        grassroots_search_html.push('<i>' + author + '</i><br/>');
        grassroots_search_html.push('' + description + '<br/>');
    } else if (json['@type'] === 'Grassroots:Location') {
        grassroots_search_html.push('<i>' + img_html + ' ' + title + '</i><br/>');
        grassroots_search_html.push(json['id']);
    } else if (json['@type'] === 'Grassroots:Programme') {
        let pi = json['principal_investigator'];

        if (json['so:url'] !== undefined && json['so:url'] !== null) {
            let program_link = json['so:url'];
            grassroots_search_html.push('<br/><a style="color:#18bc9c ! important;" target="_blank" href="' + program_link + '">' + img_html + ' ' + title + '</a><br/>');
        } else {
            grassroots_search_html.push('<i>' + img_html + ' ' + title + '</i><br/>');
        }

				if (pi !== undefined || pi !== null) {
	        grassroots_search_html.push('Principal Investigator: ' + SafePrint(pi['so:name']) + '</br>');				
				}
        grassroots_search_html.push(SafePrint(json['so:description']));
    } else if (json['@type'] === 'Grassroots:Publication') {
        if (json['so:url'] !== undefined && json['so:url'] !== null) {
            let publication_link = json['so:url'];
            grassroots_search_html.push('<br/><a style="color:#18bc9c ! important;" target="_blank" href="' + publication_link + '">' + img_html + ' ' + title + '</a><br/>');
        } else {
            grassroots_search_html.push('<i>' + img_html + ' ' + title + '</i><br/>');
        }
        grassroots_search_html.push('<i>' + json['author'] + '</i><br/>');
        grassroots_search_html.push('' + SafePrint(json['so:description']) + '</br>');
    } else if (json['@type'] === 'Grassroots:MARTiSample') {
        if (json['so:url'] !== undefined && json['so:url'] !== null) {
            let publication_link = json['so:url'];
            grassroots_search_html.push('<br/><a style="color:#18bc9c ! important;" target="_blank" href="' + publication_link + '">' + img_html + ' ' + title + '</a><br/>');
        } else {
            grassroots_search_html.push('<i>' + img_html + ' ' + title + '</i><br/>');
        }
        grassroots_search_html.push('' + SafePrint(json['so:description']) + '</br>');
    } else {
        grassroots_search_html.push('<i>' + img_html + ' ' + title + '</i><br/>');
    }

    grassroots_search_html.push('</div>');
    grassroots_search_html.push('<hr/>');
    grassroots_search_html.push('<br/>');
    return grassroots_search_html.join(' ');

}


/**
 * Show errors from backend
 *
 * @param {JSON} json - A result JSON from backend.
 */
function get_general_errors(json) {
    var html = [];
    var general_error_array = []

    if (json['errors'] != undefined) {
        if (json['errors']['error'] != undefined) {
            if (json['errors']['error']['errors'] != undefined) {
                general_error_array = json['errors']['error']['errors'];
                for (var i = 0; i < general_error_array.length; i++) {
                    html.push(general_error_array[i] + ' ');
                }

            }
        }
    }
    return html.join(' ');
}

/**
 * Format errors from result
 *
 * @param {JSON} this_result - A result JSON from backend.
 */
function handle_errors(json) {
    if (json['errors'] != undefined) {
        $.each(json['errors'], function (key, data) {
            console.log(key);
            if (key !== 'error') {
                if (data['grassroots_type'] != undefined) {
                    var grassroots_type = data['grassroots_type'];
                    var elementId = key.replace(/\s+/g, "_");
                    if (grassroots_type === "params:tabular" || grassroots_type === "params:json_array") {
                        if (key === 'PL Upload') {
                            var error_html = '';
                            var tabular_error_array = [];

                            if (data['errors'] != undefined) {

                                tabular_error_array = data['errors'];
                                if (tabular_error_array.length > 0) {
                                    error_html += 'PL Upload Sheet: <br/>';
                                    for (var t = 0; t < tabular_error_array.length; t++) {
					if (tabular_error_array[t]['row'] != undefined){ //2023. new check!
                                          var row = tabular_error_array[t]['row'];
                                          var column = tabular_error_array[t]['column'];
                                          var cell_error = tabular_error_array[t]['error'];
                                          error_html += 'Row: ' + row + ' Column: ' + column + ' Error: ' + cell_error + '<br/>';
					  }else{ //when error has no column or row, usually in successful submission
                                           var other_message =  tabular_error_array[t];
                                           error_html += other_message+'<br/>';
                                          }

                                    }
                                }
                            }
                            $('#result').append('<br/>' + error_html);

                        } else {
                            var tabular_error_array = [];

                            if (data['errors'] != undefined) {
                                tabular_error_array = data['errors'];
                                if (tabular_error_array.length > 0) {
                                    // var error_table = $('#' + elementId + ' tbody');
                                    // var error_datatable = $('#' + elementId).DataTable();

                                    for (var t = 0; t < tabular_error_array.length; t++) {
                                        var row = tabular_error_array[t]['row'];
                                        var column = tabular_error_array[t]['column'];
                                        var cell_error = tabular_error_array[t]['error'];

                                        // var cell = error_table.rows[row].cells[column];
                                        // var cell = error_table.rows.eq(row).find(column);
                                        var input_name = 'tabular^' + key + '^' + row + '^' + column;
                                        console.log(input_name);
                                        var cell = $("input[name='" + input_name + "']");
                                        console.log(cell);

                                        $(cell).css({'background-color': '#ff4d4d'});
                                        $(cell).popover({
                                            content: cell_error,
                                            placement: 'top',
                                            trigger: 'manual',
                                            animation: false
                                        }).popover('show');
                                        $(cell).on('click', function () {
                                            $(this).popover('toggle');
                                        });


                                    }
                                }
                            }
                        }
                    } else {
                        var error_messages = '';
                        var element_error_array = [];

                        if (data['errors'] != undefined) {
                            element_error_array = data['errors'];
                            for (var i = 0; i < element_error_array.length; i++) {
                                error_messages = (error_messages + ' ' + element_error_array[i]);
                            }
                        }

                        $('#' + elementId).css({'background-color': '#ff4d4d'});

                        // $('#' + elementId).tooltip({
                        //     title: error_messages,
                        //     trigger: 'manual',
                        // animation: false
                        // }).tooltip('show');
                        // $('#' + elementId).on('click',function(){$(this).tooltip('toggle');});

                        $('#' + elementId).popover({
                            content: error_messages,
                            placement: 'top',
                            trigger: 'manual',
                            animation: false
                        }).popover('show');
                        $('#' + elementId).on('click', function () {
                            $(this).popover('toggle');
                        });

                    }
                }
            }

        })
    }


}

/**
 * Format field trial search result
 *
 * @param {JSONArray} array - Field trial result JSONArray from backend.
 */
function format_fieldtrial_result(array) {
    var html = [];

    html.push('<thead>');
    html.push('<tr>');
    html.push('<th>Rank</th>');
    html.push('<th>Type</th>');
    html.push('<th>Title</th>');
    html.push('<th>Info</th>');
    html.push('<th>Link</th>');
    html.push('</tr>');
    html.push('</thead>');

    html.push('<tbody>');
    for (var i = 0; i < array.length; i++) {
        var id = array[i]['data']['_id']['$oid'];

        var type = '';

        if (array[i]['data'] != undefined) {
            type = array[i]['data']['@type'];
        }
        var title = array[i]['title'];
        var info = ''; //JSON.stringify(array[i]['data']);
        var doi = '';

        var typeText = '';
        if (type === 'Grassroots:Program') {
            typeText = 'Programme';
            info = 'Principal Investigator: ' + SafePrint(array[i]['data']['principal_investigator']) + '</br>' + SafePrint(array[i]['data']['so:description']);
            if (array[i]['data']['so:url'] !== undefined && array[i]['data']['so:url'] !== null) {
                let program_link = array[i]['data']['so:url'];
                doi = '<a target="_blank" href="' + program_link + '">Link</a>';
            }
        }
        if (type === 'Grassroots:FieldTrial') {
            typeText = 'Field Trial';
            info = array[i]['data']['team'];
        }
        if (type === 'Grassroots:Study') {
            typeText = 'Study';
            var address_name = (array[i]['data']['address']['name'] != undefined) ? array[i]['data']['address']['name'] + '<br/>' : "";
           // var address_locality = (array[i]['data']['address']['address']['Address']['addressLocality'] != undefined) ? array[i]['data']['address']['address']['Address']['addressLocality'] + '<br/>' : "";
            //var address_country = (array[i]['data']['address']['address']['Address']['addressCountry'] != undefined) ? array[i]['data']['address']['address']['Address']['addressCountry'] + '<br/>' : "";
            //var address_postcode = (array[i]['data']['address']['address']['Address']['postalCode'] != undefined) ? array[i]['data']['address']['address']['Address']['postalCode'] : "";

            info = address_name;
            //    + address_locality
            //    + address_country
           //     + address_postcode;
        }
        if (type === 'Grassroots:Phenotype') {
            typeText = 'Phenotype';
            info = array[i]['data']['trait']['so:name'];
        }
        if (type === 'Grassroots:FieldTrial') {
            doi = '<a target="_blank" href="' + root_dir + 'fieldtrial/' + id + '">View ' + typeText + '</a>';
        }
        if (type === 'Grassroots:Study') {
            doi = '<a target="_blank" href="' + root_dir + 'fieldtrial/study/' + id + '">View ' + typeText + '</a>';
        }
        html.push('<tr>');
        html.push('<td>');
        html.push(i + 1);
        html.push('</td>');
        html.push('<td>');
        html.push(typeText);
        html.push('</td>');
        html.push('<td>');
        html.push(title);
        html.push('</td>');
        html.push('<td>');
        html.push(info);
        html.push('</td>');
        html.push('<td>');
        html.push(doi);
        html.push('</td>');
        html.push('</tr>');
    }
    html.push('</tbody>');


    return html.join(' ');
}

/**
 * Check result after form submission
 *
 * @param {JSON} each_result - A result JSON from backend.
 */
function checkResult(each_result) {
    var uuid = each_result['job_uuid'];
    var status_text_key = each_result['status_text'];
    if (status_text_key == 'Partially succeeded' || status_text_key == 'Succeeded') {
        Utils.ui.reenableButton('submit_button', 'Submit');
        if (selected_service_name == service_blastn || selected_service_name == service_blastp || selected_service_name == service_blastx) {
            $('#' + uuid).html(display_each_blast_result_grasroots_markup(each_result));
        } else if (selected_service_name == service_polymarker_search) {
            $('#' + uuid).html(display_polymarker_table(each_result));
        } else {
            $('#status').html('');
            $('#result').html("Done");
            $('#' + uuid).html(JSON.stringify(each_result['results'][0]['data']));
        }
    } else if (status_text_key == 'Failed' || status_text_key == 'Failed to start' || status_text_key == 'Error') {
        var general_error = get_general_errors(each_result);
        $('#' + uuid).html('Job ' + status_text_key + ':  ' + general_error);
        handle_errors(each_result);
        Utils.ui.reenableButton('submit_button', 'Submit');
    }
    // rechecking the result from server
    else {
        $.ajax({
                url: root_dir + "service/" + publicOrPrivate + "ajax/interact_backend/",
                type: "POST",
                headers: {
                    'X-CSRFToken': csrftoken
                },
                data: '{"operations": {"operation": "get_service_results"}, "services": ["' + uuid + '"]}',
                dataType: "json",
                success: function (json) {
                    console.info(JSON.stringify(json));
                    status_text_key = json[0]['status_text'];
                    if (status_text_key == 'Partially succeeded' || status_text_key == 'Succeeded') {
                        if (selected_service_name == service_blastn || selected_service_name == service_blastp || selected_service_name == service_blastx) {
                            Utils.ui.reenableButton('submit_button', 'Submit');
                            $('#' + uuid).html(display_each_blast_result_grasroots_markup(json[0]));
                        } else if (selected_service_name == service_polymarker_search) {
                            $('#' + uuid).html(display_polymarker_table(json[0]));
                        } else if (selected_service_name == service_gru_seedbank_search || selected_service_name == service_pathogenomics_geoservice || selected_service_name == service_field_trial_search) {
                            $('#' + uuid).html(JSON.stringify(json[0]['results'][0]['data']));
                        } else {
                            $('#status').html('');
                            $('#result').html("Done");
                            downloadFile(json[0]['results'][0]['data'], selected_service_name);
                        }
                    } else if (status_text_key == 'Idle' || status_text_key == 'Pending' || status_text_key == 'Started' || status_text_key == 'Finished') {
                        jQuery('#' + uuid).html('Job ' + status_text_key + ' <img src="' + root_dir + 'static/images/ajax-loader.gif"/>');
                        var timer;
                        clearTimeout(timer);
                        timer = setTimeout(function () {
                            checkResult(each_result);
                        }, 6500);
                    } else {
                        var general_error = get_general_errors(json[0]);
                        jQuery('#' + uuid).html('Job ' + status_text_key + ' : ' + general_error);
                        handle_errors(json[0]);
                        Utils.ui.reenableButton('submit_button', 'Submit');
                    }
                }
            }
        );
    }
}


/**
 * Display BLAST result with grassroots markup
 *
 * @param {JSON} json - A BLAST result JSON from backend.
 */
function display_blast_result_grassroots_markup(json) {

    var result_html = [];
    result_html.push('<br/><br/><hr/><br/>');

    for (var i = 0; i < json['results'].length; i++) {
        result_html.push(display_each_blast_result_grasroots_markup(json['results'][i]));
    }
    $('#form').html('');
    window.scrollTo(0, 0);
    $('#result').html(result_html.join(' '));
    $('#output_format_div').show();
    changeDownloadFormat();
}

/**
 * Display one DB BLAST result with grassroots markup
 *
 * @param {JSON} each_db_result - Each BLAST database result JSON from backend.
 */
function display_each_blast_result_grasroots_markup(each_db_result) {

    var result_html = [];
    if (each_db_result['service_name'] == 'BlastN') {
        //            var each_db_result = json['results'][i];
        var uuid = each_db_result['job_uuid'];
        if (each_db_result['status_text'] == 'Succeeded') {
            if (each_db_result['results'] != undefined) {

                var db_name = each_db_result['name'];
                var dl_format_text = jQuery("#output_format option:selected").text();
                result_html.push('<a href="javascript:;" id=\"' + uuid + 'dl\" onclick=\"downloadJobFromServer(\'' + uuid + '\');\">Download Job</a> in <span class="dlformat">' + dl_format_text + '</span> format <span id=\"' + uuid + 'status\"></span><br/>');

                for (var dbi = 0; dbi < each_db_result['results'][0]['data']['blast_search_results']['reports'].length; dbi++) {

                    var query_result = each_db_result['results'][0]['data']['blast_search_results']['reports'][dbi];
                    var query_title = '';
                    if (query_result['query_title'] != undefined) {
                        query_title = query_result['query_title'];
                    }
                    var query_line = query_result['query_id'] + ': ' + query_title;
                    result_html.push('<p><b>' + query_line + '</b></p>');

                    if (query_result['hits'].length > 0) {
                        for (var j = 0; j < query_result['hits'].length; j++) {

                            var hit = query_result['hits'][j];
                            var hit_num = hit['hit_num'];
                            var scaffold_name = hit['scaffolds'][0]['scaffold'];

                            result_html.push('<div class="blastResultBox ui-corner-all">')

                            result_html.push('<p>Hit ' + hit_num + ' : ' + scaffold_name + ' | <b>Hit Sequence Length: </b>' + hit['sequence_length']);
                            result_html.push('</p>');

                            if (hit['linked_services'] != null) {
                                if (hit['linked_services']['services'].length > 0) {
                                    result_html.push('<p>Linked Services: ');
                                    for (var linki = 0; linki < hit['linked_services']['services'].length; linki++) {
                                        var link_service_json = hit['linked_services']['services'][linki];
                                        var link_service_id = generate_random_id();
                                        linked_services_global[link_service_id] = link_service_json;
                                        if (linki > 0) {
                                            result_html.push(' | ');
                                        }

                                        result_html.push(' <a href="javascript:;" id="' + link_service_id + '" onclick="run_linked_service(\'' + link_service_id + '\')">' + link_service_json['so:name'] + '</a><span id="' + link_service_id + 'status"></span> ');

                                    }
                                    result_html.push('</p>');
                                }
                            }


                            for (var y = 0; y < hit['hsps'].length; y++) {
                                var hsp = hit['hsps'][y];
                                var hsp_num = hsp['hsp_num'];
                                result_html.push('<p>Hsp: ' + hsp_num + '</p>');
                                // result_html.push('<p><b>Bit Score: </b>' + hsp['bit_score'] + ' | <b>Gaps: </b>' + hsp['gaps'] + '</p>');
                                result_html.push('<p><b>Bit Score: </b>' + hsp['bit_score'] + '</p>');
                                result_html.push('<p><b>Score: </b>' + hsp['score'] + ' | <b>Evalue: </b>' + hsp['evalue'] + '</p>');
                                //result_html.push('<p>'+  +'</p>');
                                result_html.push('<hr/>');
                                if (hsp['polymorphisms'] != undefined) {
                                    if (hsp['polymorphisms'].length > 0) {
                                        result_html.push('<p>Polymorphisms (Polymarker):</p>');
                                        result_html.push('<p>');
                                        for (var ip = 0; ip < hsp['polymorphisms'].length; ip++) {
                                            var polymorphism = hsp['polymorphisms'][ip];
                                            console.log(JSON.stringify(polymorphism));
                                            if (polymorphism['linked_services'] != undefined) {
                                                if (polymorphism['linked_services']['services'] != undefined) {
                                                    for (var linkip = 0; linkip < polymorphism['linked_services']['services'].length; linkip++) {
                                                        var polymorphism_link_service_json = polymorphism['linked_services']['services'][linkip];
                                                        var polymorphism_link_service_id = generate_random_id();
                                                        var sequence_difference = '[' + polymorphism['sequence_difference']['query'] + '/' + polymorphism['sequence_difference']['hit'] + ']';
                                                        // save in memory for post request
                                                        linked_services_global[polymorphism_link_service_id] = polymorphism_link_service_json;
                                                        var polymorphism_position = polymorphism['locus']['faldo:begin']['faldo:position'];
                                                        result_html.push(' <a href="javascript:;" id="' + polymorphism_link_service_id + '"'
                                                            + ' onmouseover="mouseover_locus(\'' + hit_num + '\', \'' + hsp_num + '\', \'' + polymorphism_position + '\')"'
                                                            + ' onmouseout="mouseout_locus(\'' + hit_num + '\', \'' + hsp_num + '\', \'' + polymorphism_position + '\')"'
                                                            + ' onclick="run_linked_service_with_redirect(\''
                                                            + polymorphism_link_service_id + '\')">Locus: ' + polymorphism_position + ' '
                                                            + sequence_difference + ' </a><span id="' + polymorphism_link_service_id + 'status"></span> |');


                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                                result_html.push('</p>');
                                result_html.push('<hr/>');


                                result_html.push('<div class="note">');
                                result_html.push('<p class="blastPosition">Query from: ' + hsp['query_location']['faldo:begin']['faldo:position'] + ' to: ' + hsp['query_location']['faldo:end']['faldo:position'] + ' Strand: ' + get_faldo_strand(hsp['query_location']['faldo:begin']['@type']) + '</p>');
                                result_html.push(alignment_formatter(hsp['query_sequence'].match(/.{1,100}/g), hsp['midline'].match(/.{1,100}/g), hsp['hit_sequence'].match(/.{1,100}/g), hit['hit_num'], hsp['hsp_num']));
                                result_html.push('<p class="blastPosition">Hit from: ' + hsp['hit_location']['faldo:begin']['faldo:position'] + ' to: ' + hsp['hit_location']['faldo:end']['faldo:position'] + ' Strand: ' + get_faldo_strand(hsp['hit_location']['faldo:begin']['@type']) + '</p>');
                                result_html.push('</div>');
                            }
                            result_html.push('</div>');
                        }
                    } else {
                        result_html.push('<p>No hits found</p>')
                    }
                }
            } else {
                result_html.push('<p>No hits found</p>')
            }
        } else {
            result_html.push('<p>Job id: ' + uuid + '</p>');
            result_html.push('<p>Status: ' + each_db_result['status_text'] + '</p>');
        }
    }
    return result_html.join(' ');
}

/**
 * Handle mouse over a SNP
 *
 * @param {String} hit_num - Hit number.
 * @param {String} hsp_num - HSP number (BLAST result).
 * @param {String} polymorphism_position - Polymorphism position number.
 */
function mouseover_locus(hit_num, hsp_num, polymorphism_position) {
    $('#' + hit_num + '-' + hsp_num + '-' + polymorphism_position + 'q').addClass('highlightSNP');
    $('#' + hit_num + '-' + hsp_num + '-' + polymorphism_position + 'm').addClass('highlightSNP');
    $('#' + hit_num + '-' + hsp_num + '-' + polymorphism_position + 'h').addClass('highlightSNP');
}

/**
 * Handle mouse out a SNP
 *
 * @param {String} hit_num - Hit number.
 * @param {String} hsp_num - HSP number (BLAST result).
 * @param {String} polymorphism_position - Polymorphism position number.
 */
function mouseout_locus(hit_num, hsp_num, polymorphism_position) {
    $('#' + hit_num + '-' + hsp_num + '-' + polymorphism_position + 'q').removeClass('highlightSNP');
    $('#' + hit_num + '-' + hsp_num + '-' + polymorphism_position + 'm').removeClass('highlightSNP');
    $('#' + hit_num + '-' + hsp_num + '-' + polymorphism_position + 'h').removeClass('highlightSNP');
}

/**
 * Display polymarker table
 *
 * @param {JSON} jsonResult - Polymarker result JSON from backend.
 */
function display_polymarker_table(jsonResult) {
    // console.log('>>>' + JSON.stringify(jsonResult));
    var uuid = jsonResult['job_uuid'];
    var csv_values = jsonResult['results'][0]['data']['primers'];
    var csv_table_selector = $('#' + uuid);
    var exons_genes_and_contigs = jsonResult['results'][0]['data']['exons_genes_and_contigs'];
    var csv_table = csv_table_selector.CSVToTable(csv_values, {
        headers: ["ID", "SNP", "Chr", "CTotal", "Contig regions", "SNP type", "A", "B", "Common", "Primer type", "Product size", "Error"],
        startLine: 1
    });
    csv_table.bind("loadComplete", function () {
        console.log("bind table");
        csv_table_selector.jExpand();
        csv_table_selector.load_msa(exons_genes_and_contigs);
    });
    // $('#statusTable').jExpand();

    // $("#show_list").click(function () {
    //     $("#statusTable").toggle();
    // });
    // $("#statusTable").hide();
    // $("#show_mask").click(function () {
    //     csv_table_selector.show_all();
    // });
    // $("#hide_mask").click(function () {
    //     csv_table_selector.hide_all();
    // });
}

/**
 * Display faldo strand type
 *
 * @param {String} faldo_type - Faldo type.
 */
function get_faldo_strand(faldo_type) {
    var strand;
    if ($.inArray("faldo:ForwardStrandPosition", faldo_type) >= 0) {
        strand = "Forward";
    } else if ($.inArray("faldo:ReverseStrandPosition", faldo_type) >= 0) {
        strand = "Reverse";
    } else {
        strand = "Unknown";
    }
    return strand;
}

/**
 * Display BLAST result alignment
 *
 * @param {String} qseq - Query sequence.
 * @param {String} midline - Midline string.
 * @param {String} hseq - Hit sequence.
 * @param {String} hit_num - Hit number.
 * @param {String} hsp_num - Hsp number.
 */
function alignment_formatter(qseq, midline, hseq, hit_num, hsp_num) {
    var alignment_html = [];
    alignment_html.push('<div class="pre-format">');
    for (var i = 0; i < qseq.length; i++) {
        // alignment_html.push(qseq[i] + '<br/>');
        // alignment_html.push(midline[i] + '<br/>');
        // alignment_html.push(hseq[i] + '<br/>');
        alignment_html.push(add_span_with_position(qseq[i], i, hit_num, hsp_num, 'q') + '<br/>');
        alignment_html.push(add_span_with_position(midline[i], i, hit_num, hsp_num, 'm') + '<br/>');
        alignment_html.push(add_span_with_position(hseq[i], i, hit_num, hsp_num, 'h') + '<br/>');
    }
    alignment_html.push('</div>');

    return alignment_html.join(' ');

}

/**
 * Display BLAST result alignment
 *
 * @param {String} seq - Sequence.
 * @param {String} row_index - Row index.
 * @param {String} hit_num - Hit number.
 * @param {String} hsp_num - Hsp number.
 * @param {String} qORh - Query or hit.
 */
function add_span_with_position(seq, row_index, hit_num, hsp_num, qORh) {
    var chars = seq.split('');
    var html = [];
    $.each(chars, function (i, el) {
        html.push('<span id="' + hit_num + '-' + hsp_num + '-' + (i + 1 + (row_index * 100)) + qORh + '">' + el + '</span>');
    });
    return html.join('');
}

/**
 * Remove strange char which might cause problem with html
 *
 * @param {String} str - Input string.
 */
function remove_strange_char(str) {
    str = str.replace(/\\n/g, "\\n")
        .replace(/\\'/g, "\\'")
        .replace(/\\"/g, '\\"')
        .replace(/\\&/g, "\\&")
        .replace(/\\r/g, "\\r")
        .replace(/\\t/g, "\\t")
        .replace(/\\b/g, "\\b")
        .replace(/\\\\/g, "\\")
        .replace(/\\f/g, "\\f");
    return str.replace(/[\u0000-\u0019]+/g, "");
}

/**
 * Change BLAST download format based on a html selector
 *
 */
function changeDownloadFormat() {
    $('.dlformat').html(jQuery("#output_format option:selected").text());
}

/**
 * Download BLAST result from server
 *
 * @param {String} id - BLAST job uuid.
 */
function downloadJobFromServer(id) {
    $('#' + id + 'status').html('<img src="' + root_dir + 'static/images/ajax-loader.gif"/>');
    $('#' + id + 'dl').removeAttr('onclick');
    var outfmt = parseInt($('#output_format').val());

    var previousjob_request_json = {
        "services": [{
            "start_service": true,
            "so:name": "BlastN",
            "parameter_set": {
                "parameters": [{
                    "param": "job_id",
                    "current_value": id
                },
                    {
                        "param": "outfmt",
                        "current_value": outfmt
                    }
                ]
            }
        }]
    };
    console.info(JSON.stringify(previousjob_request_json));
    $.ajax({
        url: root_dir + "service/" + publicOrPrivate + "ajax/interact_backend/",
        type: "POST",
        headers: {
            'X-CSRFToken': csrftoken
        },
        data: JSON.stringify(previousjob_request_json),
        dataType: "json",
        success: function (json) {
            console.info(JSON.stringify(json));

            downloadFile(json['results'][0]['results'][0]['data'], id);
            jQuery('#' + id + 'status').html('');
            jQuery('#' + id + 'dl').attr('onclick', 'downloadJobFromServer(\'' + id + '\')');
        }


    });


}


/**
 * Run a linked service in result
 *
 * @param {String} id - Job uuid.
 */
function run_linked_service(id) {
    $('#' + id + 'status').html('<img src="' + root_dir + 'static/images/ajax-loader.gif"/>');
    $('#' + id).removeAttr('onclick');

    var linked_service_request_json = linked_services_global[id];
    console.info(JSON.stringify({"services": [linked_service_request_json]}));

    $.ajax({
        url: root_dir + "service/" + publicOrPrivate + "ajax/interact_backend/",
        type: "POST",
        headers: {
            'X-CSRFToken': csrftoken
        },
        data: JSON.stringify({"services": [linked_service_request_json]}),
        dataType: "json",
        success: function (json) {
            console.info(JSON.stringify(json));

            downloadFile(json['results'][0]['results'][0]['data'], id);
            $('#' + id + 'status').html('');
            $('#' + id).attr('onclick', 'run_linked_service(\'' + id + '\')');
        }
    });
}

/**
 * Run a linked service in result
 *
 * @param {String} id - Job uuid.
 */
function run_linked_service_with_redirect(id) {
    $('#' + id + 'status').html('<img src="' + root_dir + 'static/images/ajax-loader.gif"/>');
    $('#' + id).removeAttr('onclick');

    var linked_service_request_json = linked_services_global[id];
    console.info(JSON.stringify({"services": [linked_service_request_json]}));
    var service_name = linked_service_request_json['so:name'];

    $.ajax({
        url: root_dir + "service/" + publicOrPrivate + "ajax/interact_backend/",
        type: "POST",
        headers: {
            'X-CSRFToken': csrftoken
        },
        data: JSON.stringify({"services": [linked_service_request_json]}),
        dataType: "json",
        success: function (json) {
            console.info(JSON.stringify(json));
            var uuid = json['results'][0]['job_uuid'];
            window.open("../dynamic/services_get.html?service=" + encodeURI(service_name) + '&Previous%20results=' + uuid, '_blank');
            $('#' + id + 'status').html('');
            $('#' + id).attr('onclick', 'run_linked_service_with_redirect(\'' + id + '\')');

        }
    });
}

/**
 * Make a text as a downloadble file
 *
 * @param {String} text - File content text.
 * @param {String} filename - File name.
 */
function downloadFile(text, filename) {
    var blob = new Blob([text], {type: "text/plain;charset=utf-8"});
    saveAs(blob, filename + ".txt");
}

/**
 * Generate a random text id
 *
 */
function generate_random_id() {
    var id = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < 10; i++)
        id += possible.charAt(Math.floor(Math.random() * possible.length));

    return id;
}


/**
 * Validate a fasta input text
 *
 * @param {String} fasta - Fasta input text.
 */
function validateFasta(fasta) {
    if (!fasta) { // check there is something first of all
        return false;
    }

    // immediately remove trailing spaces
    fasta = fasta.trim();

    // split on newlines...
    var lines = fasta.split('\n');

    // check for header
    for (var i = 0; i < lines.length; i++) {
        if (lines[i][0] == '>') {
            // remove one line, starting at the first position
            lines.splice(i, 1);
        }
    }

    // join the array back into a single string without newlines and
    // trailing or leading spaces
    fasta = lines.join('').trim();

    if (!fasta) { // is it empty whatever we collected ? re-check not efficient
        return false;
    }

    // note that the empty string is caught above
    // allow for Selenocysteine (U)
    return /^[ACDEFGHIKLMNPQRSTUVWY\s]+$/i.test(fasta);

}

/**
 * Handle a file select event
 *
 * @param {event} evt - File select event.
 */
function handleFileSelect(evt) {
    evt.stopPropagation();
    evt.preventDefault();

    var files = evt.dataTransfer.files; // FileList object.

    // files is a FileList of File objects. List some properties.
    var output = [];
    var f = files[0];
    output.push('<li><strong>', escape(f.name), '</strong> (', f.type || 'n/a', ') - ',
        f.size, ' bytes, last modified: ',
        f.lastModifiedDate ? f.lastModifiedDate.toLocaleDateString() : 'n/a',
        '</li>');
    // document.getElementById('list').innerHTML = '<ul>' + output.join('') + '</ul>';
    //var f = files[0];
    if (f) {
        var r = new FileReader();
        r.onload = function (e) {
            var contents = e.target.result;
            document.getElementById(evt.target.id).value = contents;
            //            console.info(evt.target.id);
            $('#' + String(evt.target.id)).trigger("change");
        }
        r.readAsText(f);
    } else {
        alert("Failed to load file");
    }
}

/**
 * Handle a file dragover event
 *
 * @param {event} evt - File select event.
 */
function handleDragOver(evt) {
    evt.stopPropagation();
    evt.preventDefault();
    evt.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
}

/**
 * Handle an excel file select event
 *
 * @param {event} evt - File select event.
 */
function handleXlsxFileSelect(evt) {
    Utils.ui.disableButton('submit_button');
    evt.stopPropagation();
    evt.preventDefault();

    var files = evt.dataTransfer.files; // FileList object.
    var table_id = evt.target.id;

    //#################
    tableId = 'PL_Upload';
    var table = $('#' + tableId);
    if ($.fn.DataTable.isDataTable(table)) {
      table.DataTable().destroy();
      table.empty();
      console.log("initial table destroyed");
    }else {
        console.log("TABLE NOT FOUND");
      }
    //#################

    // files is a FileList of File objects. List some properties.
    var f = files[0];

    //var f = files[0];
    if (f) {
        var reader = new FileReader();
        reader.onload = function (e) {
            var data = e.target.result;
            data = new Uint8Array(data);
            var workbook = XLSX.read(data, { type: 'array' });

            if (selected_service_name === 'field_trial-submit_plots') {
                //var plots;  USE GLOBAL VARIABLE!
                var filename = f.name;

                if (filename.endsWith('.xlsx')) {
                    plots = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], { raw: false });
                } else if (filename.endsWith('.csv')) {
                    var csv = XLSX.utils.sheet_to_csv(workbook.Sheets[workbook.SheetNames[0]]);
                    var result = Papa.parse(csv, {
                        header: true,
                        skipEmptyLines: true, // Skip empty lines in CSV
                        transformHeader: function (header) {
                            return header.trim(); // Trim header names
                        },
                transform: function (value, header) {
                // Custom parsing for date values. (CORRECTING FORMAT OF DATES)
                if (header.toLowerCase().includes('date')) {
                        //console.log("CHECK DATE: " + value);
                        var parts = value.split('/');
                        if (parts.length === 3) {
                            //correct incorrect CSV parsing of dates. YY -> YYYY. ONLY FOR 2000s!!
                            var year = parts[2].length === 2 ? '20' + parts[2] : parts[2];
                            //return parts[2] + '-' + parts[0].padStart(2, '0') + '-' + parts[1].padStart(2, '0');
                            return year + '-' + parts[0].padStart(2, '0') + '-' + parts[1].padStart(2, '0');
                        }
                }
                return value;
                }
                });
                plots = result.data;//.slice(1); // Exclude the first row (header row)
                console.log("CHECK CSV RESULT: " + JSON.stringify(result.data));
                }
                if (plots && plots.length > 0) {
                    plots = plots.filter(function (row) {
                        return Object.values(row).some(function (value) {
                            return value !== undefined && value !== null && value !== '';
                        });
                    });

                    $('#PL_Uploaddropstatus').html('<span style="color:#18bc9c;">File: <b><i>' + filename + '</i></b> Processing done, ready to submit.</span>');
                    $('#PL_Upload_wrapper').hide();
                    console.log("FILENAME: " + filename);
                    console.log(JSON.stringify(plots));
                    // TEST NEW FUNCTION FOR CREATING TABLE IN SAME PLACE AS THE SERVICE
                    populateDataTable(plots, table_id);
                } else {
                    console.error("Invalid file format or empty data:", filename);
                    alert("Invalid file format or empty data: " + filename);
                }
            } else {
                var csv = XLSX.utils.sheet_to_csv(workbook.Sheets[workbook.SheetNames[0]]);
                console.log('tableid: ' + table_id);
                console.log('csv: ' + csv.trim());
                table_add_rows_csv(table_id, csv.trim());
            }
        };
        reader.readAsArrayBuffer(f);

    } else {
        alert("Failed to load file");
    }
    Utils.ui.reenableButton('submit_button', 'Submit');
}

// New to display the plots in a table after being dropped
function populateDataTable(plots, tableId) {
    console.log("(populateDatable) tableId: " + tableId); // drop
    tableId = 'PL_Upload';    
    var table = $('#' + tableId);
        
  if ($.fn.DataTable.isDataTable(table)) {    
    table.DataTable().destroy();
    table.empty();
    console.log("TABLE DESTROYED");
   }

  var columns = Object.keys(plots[0]).map(function (key) {
    return { data: key, title: key, defaultContent: "" };
  });

    //console.log("COLUMNS: ",(columns));
   
      var dataTable = table.DataTable({
            destroy: true,
            scrollX: true,
            paging: false,
            aaSorting: [],
            columns: columns,
            data: plots,
            drawCallback: function () {
                console.log("TABLE CREATED");
              }
            //data: plots.slice(0,30)
        });
    
  dataTable.columns.adjust().draw();
  return dataTable;
}

// deprecated
// function display_blast_result_jsonout(json) {
//     var result_html = [];
//     result_html.push('<br/><br/><hr/><br/>');
//
//     for (var i = 0; i < json['results'].length; i++) {
//         var blast_result_string = json['results'][i]['results'][0]['data'];
//         var uuid = json['job_uuid'];
//         var description = json['results'][i]['so:description'];
//         var db = json['results'][i]['so:name'];
//
//         blast_result_string = blast_result_string.replace(/\\n/g, "\\n")
//             .replace(/\\'/g, "\\'")
//             .replace(/\\"/g, '\\"')
//             .replace(/\\&/g, "\\&")
//             .replace(/\\r/g, "\\r")
//             .replace(/\\t/g, "\\t")
//             .replace(/\\b/g, "\\b")
//             .replace(/\\\\/g, "\\")
//             .replace(/\\f/g, "\\f");
//         blast_result_string = blast_result_string.replace(/[\u0000-\u0019]+/g, "");
//
//         var blast_result_json = JSON.parse(blast_result_string);
//         console.log(blast_result_json['BlastOutput2'].length);
//         console.log(JSON.stringify(blast_result_json));
//
//         result_html.push('<fieldset>');
//         result_html.push('<legend>' + description + '</legend>');
//         for (var j = 0; j < blast_result_json['BlastOutput2'].length; j++) {
//             var query_result = blast_result_json['BlastOutput2'][j]['report']['results'];
//             var query_title = query_result['search']['query_title'];
//             if (query_title == 'undefined'){
//                 query_title = '';
//             }
//             var query_line = query_result['search']['query_id'] + ': ' + query_title;
//             result_html.push('<p><b>' + query_line + '</b></p>');
//
//             if (query_result['search']['hits'].length > 0) {
//                 for (var x = 0; x < query_result['search']['hits'].length; x++) {
//                     result_html.push('<div class="blastResultBox ui-corner-all">')
//                     var hit = query_result['search']['hits'][x];
//
//                     result_html.push('<p>' + hit['num'] + ': ' + hit['description'][0]['id'] + '</p>');
//
//                     for (var y = 0; y < hit['hsps'].length; y++) {
//                         var hsp = hit['hsps'][y];
//                         result_html.push('<p>Hsp: ' + hsp['num'] + '</p>');
//                         result_html.push('<p><b>Bit Score: </b>' + hsp['bit_score'] + ' | <b>Hit Length: </b>' + hit['len'] + ' | <b>Gaps: </b>' + hsp['gaps'] + '</p>');
//                         result_html.push('<p><b>Score: </b>' + hsp['score'] + ' | <b>Evalue: </b>' + hsp['evalue'] + '</p>');
//                         //result_html.push('<p>'+  +'</p>');
//                         result_html.push('<hr/>');
//
//                         result_html.push('<div class="note">');
//                         result_html.push('<p class="blastPosition">Query from: ' + hsp['hit_from'] + ' to: ' + hsp['hit_to'] + ' Strand: ' + hsp['hit_strand'] + '</p>');
//                         result_html.push(alignment_formatter(hsp['qseq'].match(/.{1,100}/g), hsp['midline'].match(/.{1,100}/g), hsp['hseq'].match(/.{1,100}/g)));
//                         result_html.push('</div>');
//                     }
//                     result_html.push('</div>')
//                 }
//             } else {
//                 result_html.push('<p>No hits found</p>')
//             }
//
//
//         }
//
//
//         result_html.push('</fieldset>');
//
//     }
//     //$('#form').html('');
//     $('#result').html(result_html.join(' '));
// }

/**
 * Check if an element is in an array
 *
 * @param {string} value - A value.
 * @param {array} array - An array to check.
 */
function isInArray(value, array) {
    return array.indexOf(value) > -1;
}

