

def LoadStudyTable (server_result_json):
	results = server_result_json ["results"]
	
	if results is not None:
		result = results [0]
		
		if result:
			data = result ["data"]
			
			if data:
				default_length = data ["plot_length"];
				default_width = data ["plot_width"];
				default_design = data ["study_design"];
				default_sowing_date = data ["sowing_date"];
				default_harvest_date = data ["harvest_date"];
			
				print ("data")
				print (data)
		
		