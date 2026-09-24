// If you wish to test in something like jsfiddle, there is a simulated function call at the bottom of this script.
// skyciv.validator.model({ your_skyciv_model }, log_flag)
// If log_flag is set to true the result of the validation is returned to the console.

if (typeof skyciv == "undefined") var skyciv = {};

skyciv.validator = function () {
	var functions = {};

	// BEGIN S3D MODEL SCHEMA ==== Do not remove! ============================================================
	var model_schema = {
		"$comment": "This schema for S3D models generally follows this pattern: $id, title, description, and then any keys evaluated by Ajv (type, required etc.)",
		"definitions": {},
		"$schema": "http://json-schema.org/draft-07/schema#",
		"title": "The Model Schema",
		"description": "Expected input for S3D model.",
		"type": "object",
		"required": [
			"settings",
			"nodes",
			"sections",
			"materials",
			"supports"
		],
		"properties": {
			"settings": {
				"$id": "#/properties/settings",
				"title": "The settings Schema",
				"description": "The settings are defined in the properties of the settings object.",
				"type": "object",
				"properties": {
					"units": {
						"$id": "#/properties/settings/properties/units",
						"title": "The units Schema",
						"description": "Structure the data to pass one of the schemas below.",
						"if": {
							"$id": "#/properties/settings/properties/units/implicit",
							"title": "The Implicit units Schema",
							"description": "Derive the units implicity via type.",
							"type": "string"
						},
						"then": {
							"default": "metric",
							"enum": [
								"metric",
								"imperial"
							]
						},
						"else": {
							"$id": "#/properties/settings/properties/units/explicit",
							"title": "The Explicit units Schema",
							"description": "Specify the units per parameter explicitly.",
							"type": "object",
							"required": [
								"length",
								"section_length",
								"material_strength",
								"density",
								"force",
								"moment",
								"pressure",
								"mass",
								"translation",
								"stress"
							],
							"properties": {
								"length": {
									"enum": [
										"m",
										"mm",
										"ft",
										"in"
									]
								},
								"section_length": {
									"enum": [
										"mm",
										"in"
									]
								},
								"material_strength": {
									"enum": [
										"mpa",
										"ksi",
										"psi"
									]
								},
								"temperature": {
									"enum": [
										"degc",
										"degf"
									]
								},
								"density": {
									"enum": [
										"kg/m3",
										"lb/ft3"
									]
								},
								"force": {
									"enum": [
										"kn",
										"n",
										"kg",
										"kip",
										"lb"
									]
								},
								"moment": {
									"enum": [
										"kn-m",
										"n-m",
										"kg-m",
										"kip-ft",
										"lb-ft",
										"lb-in"
									]
								},
								"pressure": {
									"enum": [
										"mpa",
										"kpa",
										"pa",
										"ksf",
										"ksi",
										"psf",
										"psi"
									]
								},
								"mass": {
									"enum": [
										"kg",
										"kip",
										"lb"
									]
								},
								"translation": {
									"enum": [
										"m",
										"mm",
										"in"
									]
								},
								"stress": {
									"enum": [
										"mpa",
										"kpa",
										"ksi",
										"psi"
									]
								}
							}
						},
						"errorMessage": {
							"if": "Please follow one specification for units. Refer to https://skyciv.com/api/v3/docs/s3d-model/#settings"
						}
					},
					"precision": {
						"$id": "#/properties/settings/properties/precision",
						"title": "The precision Schema",
						"description": "Selects the type of precision to receive your output.",
						"default": "fixed",
						"enum": [
							0,
							1,
							"fixed",
							"exponential"
						]
					},
					"precision_values": {
						"$id": "#/properties/settings/properties/precision_values",
						"title": "The precision_values Schema",
						"description": "The number of precision values to receive for the type of precision selected.",
						"type": "integer",
						"default": 3
					},
					"evaluation_points": {
						"$id": "#/properties/settings/properties/evaluation_points",
						"title": "The evaluation_points Schema",
						"description": "The number of points along each member which a solution is evaluated. Maximum possible value is 50.",
						"type": "integer",
						"default": 5,
						"minimum": 3,
						"maximum": 50
					},
					"vertical_axis": {
						"$id": "#/properties/settings/properties/vertical_axis",
						"title": "The vertical_axis Schema",
						"description": "Set 'Y' or 'Z' as the vertical axis.",
						"type": "string",
						"enum": [
							"Y",
							"Z",
							"y",
							"z"
						],
						"default": "Y"
					},
					"projection_system": {
						"$id": "#/properties/settings/properties/projection_system",
						"title": "The projection_system Schema",
						"description": "Set 'orthographic' or 'perspective as the projection system for the model view.",
						"type": "string",
						"enum": [
							"orthographic",
							"perspective"
						],
						"default": "orthographic"
					},
					"solver_timeout": {
						"$id": "#/properties/settings/properties/solver_timeout",
						"title": "The solver_timeout Schema",
						"description": "Set the allowable time in minutes for the solver to work before timing out. Base on the size of your structure.",
						"type": "integer",
						"default": 90
					},
					"accurate_buckling_shape": {
						"$id": "#/properties/settings/properties/accurate_buckling_shape",
						"title": "The accurate_buckling_shape Schema",
						"description": "This setting does not affect buckling values and factors. If enabled when a buckling analysis is performed then only the accuracy of the displayed buckled shape will be improved, however it will take longer to solve.",
						"type": "boolean",
						"default": false
					},
					"buckling_johnson": {
						"$id": "#/properties/settings/properties/buckling_johnson",
						"title": "The buckling_johnson Schema",
						"description": "Use the parabolic or J.B. Johnson formula which is a more conservative approach for buckling of intermediate-length columns. The Johnson formula will be applied for critical stresses above half the yield strength.",
						"type": "boolean",
						"default": false
					},
					"non_linear_tolerance": {
						"$id": "#/properties/settings/properties/non_linear_tolerance",
						"title": "The non_linear_tolerance Schema",
						"description": "Non-Linear Analysis will continue to solve until this tolerance (relative error percentage) is met. A smaller number takes longer for convergence.",
						"type": [
							"number",
							"string"
						],
						"default": 1,
						"minimum": 0.1,
						"maximum": 10,
						"pattern": "([1-9].[0-9]+)|(^10$)|(^[1-9]$)|(^[0].[0-9]+$)",
						"errorMessage": {
							"pattern": "should be number from 0.1 to 10."
						}
					},
					"non_linear_theory": {
						"$id": "#/properties/settings/properties/non_linear_theory",
						"title": "The non_linear_theory Schema",
						"description": "Finite Displacement theory takes into account the full movement of the member and is suitable when the displacement is very large. If displacement is small there will be negligible difference between Small and Finite Displacement Theory.",
						"type": "string",
						"enum": [
							"small",
							"finite"
						],
						"default": "small"
					},
					"auto_stabilize_model": {
						"$id": "#/properties/settings/properties/auto_stabilize_model",
						"title": "The auto_stabilize_model Schema",
						"description": "Enable this if your model has stability issues, especially if the non-linear analysis will not converge. The solver will attempt to automatically stabilize nodes that are not restrained. Recommended to leave this disabled unless you are having issues with stability.",
						"type": "boolean",
						"default": false
					},
					"apply_evaluation_points_to_continuous_member_spans": {
						"$id": "#/properties/settings/properties/apply_evaluation_points_to_continuous_member_spans",
						"title": "The apply_evaluation_points_to_continuous_member_spans Schema",
						"description": "If enabled, the evaluation_points setting is applied across each full continuous member span rather than per individual member segment.",
						"type": "boolean"
					},
					"continuous_member_node_detection_tolerance": {
						"$id": "#/properties/settings/properties/continuous_member_node_detection_tolerance",
						"title": "The continuous_member_node_detection_tolerance Schema",
						"description": "The tolerance used to detect intermediate nodes along a continuous member span.",
						"type": [
							"number",
							"string"
						]
					},
					"member_offsets_axis": {
						"$id": "#/properties/settings/properties/member_offsets_axis",
						"title": "The member_offsets_axis Schema",
						"description": "Sets whether member offsets are applied along the local or global axis.",
						"type": "string",
						"enum": [
							"local",
							"global"
						]
					},
					"linear_equation_solver": {
						"$id": "#/properties/settings/properties/linear_equation_solver",
						"title": "The linear_equation_solver Schema",
						"description": "Selects the linear equation solver used by the analysis engine.",
						"type": "string",
						"examples": [
							"direct_1"
						]
					},
					"smooth_plate_nodal_results": {
						"$id": "#/properties/settings/properties/smooth_plate_nodal_results",
						"title": "The smooth_plate_nodal_results Schema",
						"description": "If enabled, plate nodal results are smoothed/averaged across adjacent plates.",
						"type": "boolean"
					},
					"extrapolate_plate_results_from_gauss_points": {
						"$id": "#/properties/settings/properties/extrapolate_plate_results_from_gauss_points",
						"title": "The extrapolate_plate_results_from_gauss_points Schema",
						"description": "If enabled, plate results are extrapolated from the internal Gauss integration points rather than computed directly at the nodes.",
						"type": "boolean"
					},
					"calculate_shear_properties_of_wood_concrete_sections": {
						"$id": "#/properties/settings/properties/calculate_shear_properties_of_wood_concrete_sections",
						"title": "The calculate_shear_properties_of_wood_concrete_sections Schema",
						"description": "If enabled, shear properties are calculated for wood and concrete sections.",
						"type": "boolean"
					},
					"only_solve_user_defined_load_combinations": {
						"$id": "#/properties/settings/properties/only_solve_user_defined_load_combinations",
						"title": "The only_solve_user_defined_load_combinations Schema",
						"description": "If enabled, only user-defined load combinations are solved, skipping any auto-generated combinations.",
						"type": "boolean"
					},
					"include_rigid_links_for_area_loads": {
						"$id": "#/properties/settings/properties/include_rigid_links_for_area_loads",
						"title": "The include_rigid_links_for_area_loads Schema",
						"description": "If enabled, rigid links are generated to distribute area loads to supporting members.",
						"type": "boolean"
					},
					"include_inner_members_for_two_way_area_loads": {
						"$id": "#/properties/settings/properties/include_inner_members_for_two_way_area_loads",
						"title": "The include_inner_members_for_two_way_area_loads Schema",
						"description": "If enabled, members internal to a two-way area load's boundary are included when distributing the load.",
						"type": "boolean"
					},
					"dynamic_modes": {
						"$id": "#/properties/settings/properties/dynamic_modes",
						"title": "The dynamic_modes Schema",
						"description": "The number of dynamic modes to calculate for frequency/response spectrum analysis.",
						"type": [
							"integer",
							"string"
						]
					},
					"dynamic_frequency_area_reduction_factor": {
						"$id": "#/properties/settings/properties/dynamic_frequency_area_reduction_factor",
						"title": "The dynamic_frequency_area_reduction_factor Schema",
						"description": "The reduction factor applied to area loads when computing dynamic frequency/mass.",
						"type": [
							"number",
							"string"
						]
					},
					"dynamic_frequency_vertical_cutoff": {
						"$id": "#/properties/settings/properties/dynamic_frequency_vertical_cutoff",
						"title": "The dynamic_frequency_vertical_cutoff Schema",
						"description": "The vertical frequency cutoff used during dynamic frequency analysis.",
						"type": [
							"number",
							"string"
						]
					},
					"envelope_alternate_method": {
						"$id": "#/properties/settings/properties/envelope_alternate_method",
						"title": "The envelope_alternate_method Schema",
						"description": "If enabled, an alternate method is used to compute envelope results.",
						"type": "boolean"
					},
					"thumbnail": {
						"$id": "#/properties/settings/properties/thumbnail",
						"title": "The thumbnail Schema",
						"description": "Thumbnail image metadata for the model.",
						"type": "object"
					},
					"analysis_types": {
						"$id": "#/properties/settings/properties/analysis_types",
						"title": "The analysis_types Schema",
						"description": "Flags indicating which analysis types are enabled for this model.",
						"type": "object",
						"properties": {
							"linear_static": {
								"type": "boolean",
								"description": "Enables linear static analysis."
							},
							"linear_buckling": {
								"type": "boolean",
								"description": "Enables linear buckling analysis."
							},
							"non_linear_static": {
								"type": "boolean",
								"description": "Enables non-linear static analysis."
							},
							"dynamic_frequency": {
								"type": "boolean",
								"description": "Enables dynamic frequency analysis."
							},
							"response_spectrum": {
								"type": "boolean",
								"description": "Enables response spectrum analysis."
							}
						}
					},
					"visibility": {
						"$id": "#/properties/settings/properties/visibility",
						"title": "The visibility Schema",
						"description": "UI display-flags bag controlling visibility of various model entities and overlays.",
						"type": "object"
					}
				}
			},
			"details": {
				"$id": "#/properties/details",
				"title": "The details Schema",
				"description": "Meta data for the model.",
				"properties": {
					"name": {
						"type": "string",
						"pattern": "^(.+)$"
					},
					"designer": {
						"type": "string",
						"pattern": "^(.+)$"
					},
					"notes": {
						"type": "string",
						"pattern": "^([\\s\\S]+)$"
					}
				}
			},
			"nodes": {
				"$id": "#/properties/nodes",
				"title": "The nodes Schema",
				"description": "Each node is defined by an object. The properties x, y, and z represent the x, y, and z coordinates in the global axes respectively for that node.",
				"type": "object",
				"minProperties": 1,
				"patternProperties": {
					"^(.+)$": {
						"$id": "#/properties/nodes/properties/instance",
						"type": "object",
						"title": "The Nodes Instance Schema",
						"required": [
							"x",
							"y",
							"z"
						],
						"additionalProperties": false,
						"properties": {
							"x": {
								"type": "number"
							},
							"y": {
								"type": "number"
							},
							"z": {
								"type": "number"
							},
							"user_data": {}
						}
					}
				},
				"additionalProperties": false
			},
			"members": {
				"$id": "#/properties/members",
				"title": "The members Schema",
				"description": "Each member is defined by an object. Members are defined by two nodes, the section, rotation angle, and fixity of the member at each node.",
				"type": "object",
				"patternProperties": {
					"^(.+)$": {
						"$id": "#/properties/members/properties/1",
						"type": "object",
						"title": "The Members Instance Schema",
						"required": [
							"node_A",
							"node_B",
							"section_id"
						],
						"if": {
							"required": [
								"type"
							],
							"properties": {
								"type": {
									"const": "rigid"
								}
							}
						},
						"then": {
							"properties": {
								"section_id": {
									"type": "null"
								}
							}
						},
						"else": {
							"properties": {
								"section_id": {
									"$id": "#/properties/members/properties/instance/properties/section_id",
									"title": "The section_id Schema",
									"description": "The ID of the section to be applied to the member. Required to be postive. Sections are defined in their own object.",
									"type": "integer",
									"minimum": 1
								}
							}
						},
						"properties": {
							"type": {
								"$id": "#/properties/members/properties/instance/properties/type",
								"title": "The type Schema",
								"description": "Optional property. Accepts 'normal' or 'cable'. Defaults to 'normal' if this is not specified. If 'cable' is specified, then there are consequences for what is assigned to a few other properties. rotation_angle is set to 0. fixity_A and fixity_B is set to 'FFFRRR'. All offset properties assigned 0.",
								"type": "string",
								"default": "normal",
								"enum": [
									"normal",
									"normal_continuous",
									"continuous",
									"compression",
									"tension",
									"cable",
									"rigid",
									"joist"
								]
							},
							"node_A": {
								"$id": "#/properties/members/properties/instance/properties/node_ID",
								"title": "The node_A Schema",
								"description": "The starting node. Identifed by the node ID.",
								"type": [
									"integer",
									"string"
								],
								"minimum": 1
							},
							"node_B": {
								"$id": "#/properties/members/properties/instance/properties/node_B",
								"title": "The node_B Schema",
								"description": "The ending node. Identifed by the node ID.",
								"type": [
									"integer",
									"string"
								],
								"minimum": 1
							},
							"rotation_angle": {
								"$id": "#/properties/members/properties/instance/properties/rotation_angle",
								"title": "The rotation_angle Schema",
								"description": "Rotate the member in degrees about its own axis. If 'type' property is 'cable', then this is assigned 0 (even if another value is specified here).",
								"type": "number",
								"examples": [
									0
								],
								"minimum": -360,
								"maximum": 360
							},
							"fixity_A": {
								"$id": "#/properties/members/properties/instance/properties/fixity_A",
								"title": "The fixity_A Schema",
								"description": "How the member is connected about node A represented by a restraint code. The first three characters represent translational degrees of freedom in the local x, y, and z axes. The last 3 character represent rotational degrees of freedom in the local x, y, and z axes. F = Fixed and R = Released. If 'type' property is 'cable' then this is assigned 'FFFRRR' (even if another value is specified here).",
								"type": "string",
								"examples": [
									"FFFFFF"
								],
								"pattern": "^[FSRfsr]{6}$",
								"errorMessage": {
									"pattern": "should be 6 letter code with F or R (Fixed or Released) eg. 'FFFRRR'"
								}
							},
							"fixity_B": {
								"$id": "#/properties/members/properties/instance/properties/fixity_B",
								"title": "The fixity_B Schema",
								"description": "How the member is connected about node B represented by a restraint code. If 'type' property is 'cable', then this is assigned 'FFFRRR' (even if another value is specified here).",
								"type": "string",
								"default": "",
								"examples": [
									"FFFFFF"
								],
								"pattern": "^[FSRfsr]{6}$",
								"errorMessage": {
									"pattern": "should be 6 letter code with F or R (Fixed or Released) eg. 'FFFRRR'"
								}
							},
							"offset_Ax": {
								"$id": "#/properties/members/properties/instance/properties/offset_Ax",
								"title": "The offset_Ax Schema",
								"description": "The local x distance that the member is offset from its centroid at node. If 'type' property is 'cable', then this is assigned 0 (even if another value is specified here).",
								"type": [
									"number",
									"string"
								]
							},
							"offset_Ay": {
								"$id": "#/properties/members/properties/instance/properties/offset_Ay",
								"title": "The offset_Ay Schema",
								"description": "The local y distance that the member is offset from its centroid at node. If 'type' property is 'cable', then this is assigned 0 (even if another value is specified here).",
								"type": [
									"number",
									"string"
								]
							},
							"offset_Az": {
								"$id": "#/properties/members/properties/instance/properties/offset_Az",
								"title": "The offset_Az Schema",
								"description": "The local z distance that the member is offset from its centroid at node. If 'type' property is 'cable', then this is assigned 0 (even if another value is specified here).",
								"type": [
									"number",
									"string"
								]
							},
							"offset_Bx": {
								"$id": "#/properties/members/properties/instance/properties/offset_Bx",
								"title": "The offset_Bx Schema",
								"description": "The local x distance that the member is offset from its centroid at node. If 'type' property is 'cable', then this is assigned 0 (even if another value is specified here).",
								"type": [
									"number",
									"string"
								]
							},
							"offset_By": {
								"$id": "#/properties/members/properties/instance/properties/offset_By",
								"title": "The offset_By Schema",
								"description": "The local y distance that the member is offset from its centroid at node. If 'type' property is 'cable', then this is assigned 0 (even if another value is specified here).",
								"type": [
									"number",
									"string"
								]
							},
							"offset_Bz": {
								"$id": "#/properties/members/properties/instance/properties/offset_Bz",
								"title": "The offset_Bz Schema",
								"description": "The local z distance that the member is offset from its centroid at node. If 'type' property is 'cable', then this is assigned 0 (even if another value is specified here).",
								"type": [
									"number",
									"string"
								]
							},
							"cable_length": {
								"$id": "#/properties/members/properties/instance/properties/cable_length",
								"title": "The cable_length Schema",
								"description": "Optional property. Only relevant if 'type' property is set to 'cable', but even if the 'type' is a 'cable', it is optional to assign. A cable length can be specified to account for sagging or pre-tension. Do not set this property if you do not need to assign pre-tension or sagging.",
								"type": [
									"number",
									"string",
									"null"
								]
							},
							"user_data": {},
							"disable_non_linear_effects": {
								"$id": "#/properties/members/properties/instance/properties/disable_non_linear_effects",
								"title": "The disable_non_linear_effects Schema",
								"description": "If 'yes', disables non-linear effects (e.g. P-Delta) for this member even if enabled globally.",
								"type": "string",
								"enum": [
									"yes",
									"no"
								]
							},
							"stiffness_A_Ry": {
								"$id": "#/properties/members/properties/instance/properties/stiffness_A_Ry",
								"title": "The stiffness_A_Ry Schema",
								"description": "Rotational release stiffness (partial fixity) about the local y axis at node A. Only applies where the corresponding fixity code character is 'S' (spring/semi-rigid) rather than F or R. Enter the actual stiffness (number > 0) or a percentage string between '0%' and '100%'.",
								"type": [
									"number",
									"string"
								]
							},
							"stiffness_A_Rz": {
								"$id": "#/properties/members/properties/instance/properties/stiffness_A_Rz",
								"title": "The stiffness_A_Rz Schema",
								"description": "Rotational release stiffness (partial fixity) about the local z axis at node A. Only applies where the corresponding fixity code character is 'S' (spring/semi-rigid) rather than F or R. Enter the actual stiffness (number > 0) or a percentage string between '0%' and '100%'.",
								"type": [
									"number",
									"string"
								]
							},
							"stiffness_B_Ry": {
								"$id": "#/properties/members/properties/instance/properties/stiffness_B_Ry",
								"title": "The stiffness_B_Ry Schema",
								"description": "Rotational release stiffness (partial fixity) about the local y axis at node B. Only applies where the corresponding fixity code character is 'S' (spring/semi-rigid) rather than F or R. Enter the actual stiffness (number > 0) or a percentage string between '0%' and '100%'.",
								"type": [
									"number",
									"string"
								]
							},
							"stiffness_B_Rz": {
								"$id": "#/properties/members/properties/instance/properties/stiffness_B_Rz",
								"title": "The stiffness_B_Rz Schema",
								"description": "Rotational release stiffness (partial fixity) about the local z axis at node B. Only applies where the corresponding fixity code character is 'S' (spring/semi-rigid) rather than F or R. Enter the actual stiffness (number > 0) or a percentage string between '0%' and '100%'.",
								"type": [
									"number",
									"string"
								]
							}
						},
						"errorMessage": {
							"if": "Specfication for members can be found at https://skyciv.com/api/v3/docs/s3d-model/#members"
						}
					}
				},
				"additionalProperties": false
			},
			"plates": {
				"$id": "#/properties/plates",
				"title": "The plates Schema",
				"description": "Each plate is defined by an object.",
				"type": "object",
				"patternProperties": {
					"^(.+)$": {
						"$id": "#/properties/plates/properties/instance",
						"type": "object",
						"title": "The Plates Instance Schema",
						"required": [
							"nodes",
							"thickness",
							"material_id",
							"rotZ",
							"type",
							"offset",
							"state"
						],
						"properties": {
							"nodes": {
								"$id": "#/properties/plates/properties/instance/properties/nodes",
								"title": "The Nodes Schema",
								"description": "The nodes which make up the plate. A minimum of 3 nodes are required to specify a plate. Enter this as a string with double quotes, with each node id number separated by commas.",
								"type": [
									"array",
									"string"
								],
								"examples": [
									"4,5,7,6"
								],
								"pattern": "^(.+)$",
								"items": {
									"type": [
										"integer",
										"string"
									]
								},
								"errorMessage": {
									"pattern": "should be a comma-seperated list of 4 nodes eg. '1,2,3,4'"
								}
							},
							"thickness": {
								"$id": "#/properties/plates/properties/instance/properties/thickness",
								"title": "The thickness Schema",
								"description": "The thickness of the plate.",
								"type": "number",
								"exclusiveMinimum": 0,
								"examples": [
									50
								]
							},
							"material_id": {
								"$id": "#/properties/plates/properties/instance/properties/material_id",
								"title": "The material_id Schema",
								"description": "The material of the plate. Identified by the material ID defined in the 'materials' object.",
								"type": "integer",
								"minimum": 1
							},
							"rotZ": {
								"$id": "#/properties/plates/properties/instance/properties/rotZ",
								"title": "The rotZ Schema",
								"description": "Rotation of plate about the plate's local Z (normal) axis in degrees.",
								"default": 0,
								"type": "number"
							},
							"type": {
								"$id": "#/properties/plates/properties/instance/properties/type",
								"title": "The type Schema",
								"description": "Currently only accepts 'mindlin'. Mindlin plates take into account shear deformations based on the Mindlin-Reissner Theory. Plans to implement the Kirchhoff Plate is in our future works list.",
								"type": "string",
								"default": "auto",
								"enum": [
									"auto",
									"mindlin"
								],
								"errorMessage": {
									"enum": "should be 'auto'. Implementation of the Kirchoff Plate is in our development roadmap."
								}
							},
							"offset": {
								"$id": "#/properties/plates/properties/instance/properties/offset",
								"title": "The offset Schema",
								"description": "Offset of the plate in its local z-axis.",
								"default": 0,
								"type": "number"
							},
							"state": {
								"$id": "#/properties/plates/properties/instance/properties/state",
								"title": "The state Schema",
								"description": "'stress' or 'strain' denotes whether the plate is in a state of 'Plane Stress' or 'Plane Stress'.",
								"type": "string",
								"default": "stress",
								"pattern": "stress|strain",
								"errorMessage": {
									"pattern": "should be 'stress' or 'strain'."
								}
							},
							"holes": {
								"$id": "#/properties/plates/properties/instance/properties/holes",
								"title": "The holes Schema",
								"type": [
									"array",
									"null"
								],
								"items": {
									"pattern": "^(.+)$",
									"errorMessage": {
										"pattern": "should be a comma-seperated list of nodes eg. '1,2,3,4'"
									}
								}
							},
							"diaphragm": {
								"$id": "#/properties/plates/properties/instance/properties/diaphragm",
								"title": "The diaphragm Schema",
								"type": "string",
								"default": "no",
								"enum": [
									"rigid",
									"no"
								],
								"errorMessage": {
									"enum": "should be 'rigid' or 'no'."
								}
							},
							"membrane_thickness": {
								"$id": "#/properties/plates/properties/instance/properties/membrane_thickness",
								"title": "The membrane thickness Schema",
								"description": "Membrane thickness of the plate.",
								"default": 0,
								"type": [
									"number",
									"null",
									"string"
								],
								"if": {
									"type": "string"
								},
								"then": {
									"enum": [
										""
									]
								}
							},
							"shear_thickness": {
								"$id": "#/properties/plates/properties/instance/properties/shear_thickness",
								"title": "The shear thickness Schema",
								"description": "Shear thickness of the plate.",
								"default": 0,
								"type": [
									"number",
									"null",
									"string"
								],
								"if": {
									"type": "string"
								},
								"then": {
									"enum": [
										""
									]
								}
							},
							"bending_thickness": {
								"$id": "#/properties/plates/properties/instance/properties/bending_thickness",
								"title": "The bending thickness Schema",
								"description": "Bending thickness of the plate.",
								"default": 0,
								"type": [
									"number",
									"null",
									"string"
								],
								"if": {
									"type": "string"
								},
								"then": {
									"enum": [
										""
									]
								}
							},
							"user_data": {},
							"drilling_stiffness_factor": {
								"$id": "#/properties/plates/properties/instance/properties/drilling_stiffness_factor",
								"title": "The drilling_stiffness_factor Schema",
								"description": "Factor applied to the plate's drilling (rotational) stiffness about its normal axis.",
								"type": "number"
							},
							"diaphragm_internal_nodes": {
								"$id": "#/properties/plates/properties/instance/properties/diaphragm_internal_nodes",
								"title": "The diaphragm_internal_nodes Schema",
								"description": "Internal node IDs included in a rigid diaphragm for this plate; null if not applicable.",
								"type": [
									"array",
									"null"
								]
							},
							"diaphragm_fixity": {
								"$id": "#/properties/plates/properties/instance/properties/diaphragm_fixity",
								"title": "The diaphragm_fixity Schema",
								"description": "Fixity/restraint applied to the diaphragm; null if not applicable.",
								"type": [
									"string",
									"null"
								]
							}
						},
						"$comment": "patternProperties checks for is_meshed or isMeshed key. A proposed change to ajv is 'patternRequired'",
						"patternProperties": {
							"isMeshed|is_meshed": {
								"$id": "#/properties/plates/properties/instance/properties/is_meshed",
								"title": "The is_meshed Schema",
								"type": "boolean",
								"default": false
							}
						}
					}
				},
				"additionalProperties": false
			},
			"meshed_plates": {
				"$id": "#/properties/meshed_plates",
				"title": "The meshed_plates Schema",
				"description": "Each plate is defined by an object with properties. Plates are defined by the nodes making them up (3-4), their parent plate, and their rotation.",
				"type": "object",
				"patternProperties": {
					"^[1-9][0-9]*$": {
						"$id": "#/properties/meshed_plates/properties/instance",
						"type": "object",
						"title": "The Meshed Plates Instance Schema",
						"required": [
							"node_A",
							"node_B",
							"node_C",
							"node_D",
							"parent_plate",
							"rotZ"
						],
						"properties": {
							"node_A": {
								"$id": "#/properties/meshed_plates/properties/instance/properties/node_A",
								"title": "The node_A Schema",
								"description": "The first node of the meshed plate. Meshed plates must be quadrilateral elements.",
								"type": [
									"integer",
									"string"
								],
								"minimum": 1
							},
							"node_B": {
								"$id": "#/properties/meshed_plates/properties/instance/properties/node_B",
								"title": "The node_B Schema",
								"description": "The second node of the meshed plate. Meshed plates must be quadrilateral elements.",
								"type": [
									"integer",
									"string"
								],
								"minimum": 1
							},
							"node_C": {
								"$id": "#/properties/meshed_plates/properties/instance/properties/node_C",
								"title": "The node_C Schema",
								"description": "The third node of the meshed plate. Meshed plates must be quadrilateral elements.",
								"type": [
									"integer",
									"string"
								],
								"minimum": 1
							},
							"node_D": {
								"$id": "#/properties/meshed_plates/properties/instance/properties/node_D",
								"title": "The node_D Schema",
								"description": "The fourth node of the meshed plate. Meshed plates must be quadrilateral elements.",
								"type": [
									"integer",
									"string"
								],
								"minimum": 1
							},
							"parent_plate": {
								"$id": "#/properties/meshed_plates/properties/instance/properties/parent_plate",
								"title": "The parent_plate Schema",
								"description": "The id of the plate which the meshed plate originated from.",
								"type": [
									"integer",
									"string"
								],
								"minimum": 1
							},
							"rotZ": {
								"$id": "#/properties/meshed_plates/properties/instance/properties/rotZ",
								"title": "The rotZ Schema",
								"description": "Rotation of plate about the plate's local Z (normal) axis in degrees.",
								"default": 0,
								"type": "number"
							}
						}
					}
				},
				"additionalProperties": false
			},
			"materials": {
				"$id": "#/properties/materials",
				"title": "The materials Schema",
				"description": "Each material is defined as an object with properties.",
				"type": "object",
				"patternProperties": {
					"^(.+)$": {
						"$id": "#/properties/materials/properties/instance",
						"title": "The Materials Instance Schema",
						"type": "object",
						"required": [
							"name",
							"density",
							"elasticity_modulus",
							"poissons_ratio"
						],
						"properties": {
							"name": {
								"$id": "#/properties/materials/properties/instance/properties/name",
								"title": "The name Schema",
								"description": "The name of the material.",
								"type": "string",
								"default": "",
								"examples": [
									"Structural Steel"
								],
								"pattern": "^(.*)$"
							},
							"density": {
								"$id": "#/properties/materials/properties/instance/properties/density",
								"title": "The density Schema",
								"description": "The density of the material.",
								"type": "number",
								"exclusiveMinimum": 0
							},
							"elasticity_modulus": {
								"$id": "#/properties/materials/properties/instance/properties/elasticity_modulus",
								"title": "The elasticity_modulus Schema",
								"description": "Modulus of elasticity of the material. Also known as Young's Modulus.",
								"type": "number",
								"exclusiveMinimum": 0
							},
							"poissons_ratio": {
								"$id": "#/properties/materials/properties/1/properties/poissons_ratio",
								"title": "The poissons_ratio Schema",
								"description": "Poisson's Ratio, also known as coefficient of expansion.",
								"type": "number",
								"exclusiveMinimum": 0
							},
							"user_data": {},
							"id": {
								"$id": "#/properties/materials/properties/instance/properties/id",
								"title": "The id Schema",
								"description": "The material's ID.",
								"type": "integer",
								"minimum": 1
							},
							"class": {
								"$id": "#/properties/materials/properties/instance/properties/class",
								"title": "The class Schema",
								"description": "The material class/category, affects available design checks.",
								"type": "string",
								"enum": [
									"steel",
									"aluminium",
									"concrete",
									"wood",
									"masonry",
									"other"
								]
							},
							"yield_strength": {
								"$id": "#/properties/materials/properties/instance/properties/yield_strength",
								"title": "The yield_strength Schema",
								"description": "Yield strength",
								"type": [
									"number",
									"null"
								],
								"minimum": 0
							},
							"ultimate_strength": {
								"$id": "#/properties/materials/properties/instance/properties/ultimate_strength",
								"title": "The ultimate_strength Schema",
								"description": "Ultimate strength",
								"type": [
									"number",
									"null"
								],
								"minimum": 0
							},
							"thermal_expansion_coefficient": {
								"$id": "#/properties/materials/properties/instance/properties/thermal_expansion_coefficient",
								"title": "The thermal_expansion_coefficient Schema",
								"description": "The coefficient of thermal expansion of the material.",
								"type": [
									"number",
									"null"
								]
							},
							"shear_modulus": {
								"$id": "#/properties/materials/properties/instance/properties/shear_modulus",
								"title": "The shear_modulus Schema",
								"description": "Shear modulus of the material.",
								"type": [
									"number",
									"null"
								],
								"exclusiveMinimum": 0
							},
							"elasticity_modulus_x": {
								"$id": "#/properties/materials/properties/instance/properties/elasticity_modulus_x",
								"title": "The elasticity_modulus_x Schema",
								"description": "Orthotropic modulus of elasticity in the material's local x direction.",
								"type": [
									"number",
									"null"
								],
								"exclusiveMinimum": 0
							},
							"elasticity_modulus_y": {
								"$id": "#/properties/materials/properties/instance/properties/elasticity_modulus_y",
								"title": "The elasticity_modulus_y Schema",
								"description": "Orthotropic modulus of elasticity in the material's local y direction.",
								"type": [
									"number",
									"null"
								],
								"exclusiveMinimum": 0
							},
							"shear_modulus_xy": {
								"$id": "#/properties/materials/properties/instance/properties/shear_modulus_xy",
								"title": "The shear_modulus_xy Schema",
								"description": "Orthotropic shear modulus in the xy plane.",
								"type": [
									"number",
									"null"
								],
								"exclusiveMinimum": 0
							},
							"shear_modulus_xz": {
								"$id": "#/properties/materials/properties/instance/properties/shear_modulus_xz",
								"title": "The shear_modulus_xz Schema",
								"description": "Orthotropic shear modulus in the xz plane.",
								"type": [
									"number",
									"null"
								],
								"exclusiveMinimum": 0
							},
							"shear_modulus_yz": {
								"$id": "#/properties/materials/properties/instance/properties/shear_modulus_yz",
								"title": "The shear_modulus_yz Schema",
								"description": "Orthotropic shear modulus in the yz plane.",
								"type": [
									"number",
									"null"
								],
								"exclusiveMinimum": 0
							},
							"poissons_ratio_xy": {
								"$id": "#/properties/materials/properties/instance/properties/poissons_ratio_xy",
								"title": "The poissons_ratio_xy Schema",
								"description": "Orthotropic Poisson's ratio in the xy plane.",
								"type": [
									"number",
									"null"
								]
							}
						}
					}
				},
				"additionalProperties": false
			},
			"supports": {
				"$id": "#/properties/supports",
				"title": "The supports Schema",
				"description": "Each support is defined by an object with properties. Supports are defined by their node position (or, for a line support, a set of nodes via 'nodes'), restraint code, translational and rotational stiffness.",
				"type": "object",
				"patternProperties": {
					"^(.+)$": {
						"$id": "#/properties/supports/properties/instance",
						"title": "The Supports Instance Schema",
						"type": "object",
						"properties": {
							"node": {
								"$id": "#/properties/supports/properties/instance/properties/node",
								"title": "The node Schema",
								"type": [
									"integer",
									"string"
								],
								"minimum": 1
							},
							"restraint_code": {
								"$id": "#/properties/supports/properties/instance/properties/restraint_code",
								"title": "The restraint_code Schema",
								"description": "A 6 character restraint code. The first three characters represent translational degrees of freedom in the global x, y, and z axes. The last 3 character represent rotational degrees of freedom in the global x, y, and z axes. F = Fixed, R = Released, S = Spring supported.",
								"type": "string",
								"default": "",
								"examples": [
									"FFFFFF"
								],
								"pattern": "^[FSRfsr]{6}$",
								"errorMessage": {
									"pattern": "should be 6 letter code with F, R, or S (Fixed, Released, or Spring) eg. 'FFFRSR'"
								}
							},
							"tx": {
								"$id": "#/properties/supports/properties/instance/properties/tx",
								"title": "The tx Schema",
								"description": "Spring stiffness for translation in the x axis. Only applies if the restraint code has an 'S' character set in the x translational direction.",
								"default": 0,
								"type": "number",
								"minimum": 0
							},
							"ty": {
								"$id": "#/properties/supports/properties/instance/properties/ty",
								"title": "The ty Schema",
								"description": "Spring stiffness for translation in the y axis. Only applies if the restraint code has an S' character set in the y translational direction.",
								"default": 0,
								"type": "number",
								"minimum": 0
							},
							"tz": {
								"$id": "#/properties/supports/properties/instance/properties/tz",
								"title": "The tz Schema",
								"description": "Spring stiffness for translation in the z axis. Only applies if the restraint code has an 'S' character set in the z translational direction.",
								"default": 0,
								"type": "number",
								"minimum": 0
							},
							"rx": {
								"$id": "#/properties/supports/properties/instance/properties/rx",
								"title": "The rx Schema",
								"description": "Spring stiffness for rotation in the x axis. Only applies if the restraint code has an 'S' character set in the x rotational direction.",
								"default": 0,
								"type": "number",
								"minimum": 0
							},
							"ry": {
								"$id": "#/properties/supports/properties/instance/properties/ry",
								"title": "The ry Schema",
								"description": "Spring stiffness for rotation in the y axis. Only applies if the restraint code has an 'S' character set in the y rotational direction.",
								"default": 0,
								"type": "number",
								"minimum": 0
							},
							"rz": {
								"$id": "#/properties/supports/properties/instance/properties/rz",
								"title": "The rz Schema",
								"description": "Spring stiffness for rotation in the z axis. Only applies if the restraint code has an 'S'character set in the z rotational direction.",
								"default": 0,
								"type": "number",
								"minimum": 0
							},
							"direction_code": {
								"$id": "#/properties/supports/properties/instance/properties/direction_code",
								"title": "The direction_code Schema",
								"description": "A 6 character code indicating support direction on all axes. 'B' for both positive and negative directions along the axis. 'P' for positive-only direction and 'N' for negative-only direction.",
								"type": "string",
								"default": "",
								"examples": [
									"BBBBBB"
								],
								"pattern": "^[BPN]{6}$|()",
								"errorMessage": {
									"pattern": "should be a 6 letter code with B, P, or N (Both, Positive, or Negative). eg. 'BBBNPN'"
								}
							},
							"user_data": {},
							"type": {
								"$id": "#/properties/supports/properties/instance/properties/type",
								"title": "The type Schema",
								"description": "'node' = support applied to a single node (default). 'line' = support applied along a line connecting multiple nodes.",
								"type": "string",
								"enum": [
									"node",
									"line"
								],
								"default": "node"
							},
							"nodes": {
								"$id": "#/properties/supports/properties/instance/properties/nodes",
								"title": "The nodes Schema",
								"description": "Comma-separated list of node IDs the line support runs through. Only used when type is 'line'.",
								"type": [
									"array",
									"string"
								],
								"examples": [
									"4,5,7,6"
								],
								"pattern": "^(.+)$"
							},
							"non_linear_spring_stiffness": {
								"$id": "#/properties/supports/properties/instance/properties/non_linear_spring_stiffness",
								"title": "The non_linear_spring_stiffness Schema",
								"description": "Optional non-linear spring stiffness definitions for spring-supported ('S') translational/rotational directions. Each key (tx/ty/tz/rx/ry/rz) defines how that direction's spring stiffness varies depending on another response quantity (e.g. a reaction or displacement).",
								"type": "object",
								"properties": {
									"tx": {
										"type": "object",
										"required": ["stiffness_dependency", "relationship"],
										"properties": {
											"stiffness_dependency": { "type": "string", "description": "The quantity that this direction's stiffness depends on, e.g. 'reaction_fx', 'reaction_mx', 'displacement_rx'." },
											"relationship": {
												"type": "object",
												"required": ["symmetric", "values"],
												"properties": {
													"symmetric": { "type": "boolean", "description": "If true, the relationship is mirrored for negative values of the dependency." },
													"values": {
														"type": "array",
														"description": "An array of [dependency_value, stiffness_value] pairs defining a piecewise stiffness curve.",
														"items": { "type": "array", "minItems": 2, "maxItems": 2, "items": { "type": "number" } }
													}
												}
											}
										}
									},
									"ty": {
										"type": "object",
										"required": ["stiffness_dependency", "relationship"],
										"properties": {
											"stiffness_dependency": { "type": "string", "description": "The quantity that this direction's stiffness depends on, e.g. 'reaction_fx', 'reaction_mx', 'displacement_rx'." },
											"relationship": {
												"type": "object",
												"required": ["symmetric", "values"],
												"properties": {
													"symmetric": { "type": "boolean", "description": "If true, the relationship is mirrored for negative values of the dependency." },
													"values": {
														"type": "array",
														"description": "An array of [dependency_value, stiffness_value] pairs defining a piecewise stiffness curve.",
														"items": { "type": "array", "minItems": 2, "maxItems": 2, "items": { "type": "number" } }
													}
												}
											}
										}
									},
									"tz": {
										"type": "object",
										"required": ["stiffness_dependency", "relationship"],
										"properties": {
											"stiffness_dependency": { "type": "string", "description": "The quantity that this direction's stiffness depends on, e.g. 'reaction_fx', 'reaction_mx', 'displacement_rx'." },
											"relationship": {
												"type": "object",
												"required": ["symmetric", "values"],
												"properties": {
													"symmetric": { "type": "boolean", "description": "If true, the relationship is mirrored for negative values of the dependency." },
													"values": {
														"type": "array",
														"description": "An array of [dependency_value, stiffness_value] pairs defining a piecewise stiffness curve.",
														"items": { "type": "array", "minItems": 2, "maxItems": 2, "items": { "type": "number" } }
													}
												}
											}
										}
									},
									"rx": {
										"type": "object",
										"required": ["stiffness_dependency", "relationship"],
										"properties": {
											"stiffness_dependency": { "type": "string", "description": "The quantity that this direction's stiffness depends on, e.g. 'reaction_fx', 'reaction_mx', 'displacement_rx'." },
											"relationship": {
												"type": "object",
												"required": ["symmetric", "values"],
												"properties": {
													"symmetric": { "type": "boolean", "description": "If true, the relationship is mirrored for negative values of the dependency." },
													"values": {
														"type": "array",
														"description": "An array of [dependency_value, stiffness_value] pairs defining a piecewise stiffness curve.",
														"items": { "type": "array", "minItems": 2, "maxItems": 2, "items": { "type": "number" } }
													}
												}
											}
										}
									},
									"ry": {
										"type": "object",
										"required": ["stiffness_dependency", "relationship"],
										"properties": {
											"stiffness_dependency": { "type": "string", "description": "The quantity that this direction's stiffness depends on, e.g. 'reaction_fx', 'reaction_mx', 'displacement_rx'." },
											"relationship": {
												"type": "object",
												"required": ["symmetric", "values"],
												"properties": {
													"symmetric": { "type": "boolean", "description": "If true, the relationship is mirrored for negative values of the dependency." },
													"values": {
														"type": "array",
														"description": "An array of [dependency_value, stiffness_value] pairs defining a piecewise stiffness curve.",
														"items": { "type": "array", "minItems": 2, "maxItems": 2, "items": { "type": "number" } }
													}
												}
											}
										}
									},
									"rz": {
										"type": "object",
										"required": ["stiffness_dependency", "relationship"],
										"properties": {
											"stiffness_dependency": { "type": "string", "description": "The quantity that this direction's stiffness depends on, e.g. 'reaction_fx', 'reaction_mx', 'displacement_rx'." },
											"relationship": {
												"type": "object",
												"required": ["symmetric", "values"],
												"properties": {
													"symmetric": { "type": "boolean", "description": "If true, the relationship is mirrored for negative values of the dependency." },
													"values": {
														"type": "array",
														"description": "An array of [dependency_value, stiffness_value] pairs defining a piecewise stiffness curve.",
														"items": { "type": "array", "minItems": 2, "maxItems": 2, "items": { "type": "number" } }
													}
												}
											}
										}
									}
								}
							}
						},
						"if": {
							"properties": {
								"type": {
									"const": "line"
								}
							},
							"required": [
								"type"
							]
						},
						"then": {
							"required": [
								"nodes",
								"restraint_code"
							]
						},
						"else": {
							"required": [
								"node",
								"restraint_code"
							]
						}
					}
				},
				"additionalProperties": false
			},
			"settlements": {
				"$id": "#/properties/settlements",
				"title": "The settlements Schema",
				"description": "Each settlement is defined by an object with properties. Settlements are defined by their node location, and their translational or rotational magnitude in each axis.",
				"type": "object",
				"patternProperties": {
					"^[1-9][0-9]*$": {
						"$id": "#/properties/settlements/properties/instance",
						"title": "The Settlements Instance Schema",
						"type": "object",
						"required": [
							"node",
							"tx",
							"ty",
							"tz",
							"rx",
							"ry",
							"rz"
						],
						"properties": {
							"node": {
								"$id": "#/properties/settlements/properties/instance/properties/node",
								"title": "The Node Schema",
								"description": "The node location where the settlement is applied. The value is the node ID.",
								"type": [
									"integer",
									"string"
								],
								"minimum": 1
							},
							"tx": {
								"$id": "#/properties/settlements/properties/instance/properties/tx",
								"title": "The tx Schema",
								"description": "Displacement of settlement in the x axis.",
								"type": "number"
							},
							"ty": {
								"$id": "#/properties/settlements/properties/instance/properties/ty",
								"title": "The ty Schema",
								"description": "Displacement of settlement in the y axis.",
								"type": "number"
							},
							"tz": {
								"$id": "#/properties/settlements/properties/instance/properties/tz",
								"title": "The tz Schema",
								"description": "Displacement of settlement in the z axis.",
								"type": "number"
							},
							"rx": {
								"$id": "#/properties/settlements/properties/instance/properties/rx",
								"title": "The rx Schema",
								"description": "Rotation of settlement in the x axis.",
								"type": "number"
							},
							"ry": {
								"$id": "#/properties/settlements/properties/instance/properties/ry",
								"title": "The ry Schema",
								"description": "Rotation of settlement in the y axis.",
								"type": "number"
							},
							"rz": {
								"$id": "#/properties/settlements/properties/instance/properties/rz",
								"title": "The rz Schema",
								"description": "Rotation of settlement in the z axis.",
								"type": "number"
							},
							"user_data": {}
						}
					}
				},
				"additionalProperties": false
			},
			"point_loads": {
				"$id": "#/properties/point_loads",
				"title": "The point_loads Schema",
				"description": "Each point load is defined by an object with properties depending on the location that the point load is applied. Point loads are defined by their location type (node or member), magnitude, and load group.",
				"type": "object",
				"patternProperties": {
					"^[1-9][0-9]*$": {
						"$id": "#/properties/point_loads/properties/instance",
						"title": "The Point Loads Instance Schema",
						"type": "object",
						"required": [
							"type",
							"x_mag",
							"y_mag",
							"z_mag",
							"load_group"
						],
						"properties": {
							"type": {
								"$id": "#/properties/point_loads/properties/instance/properties/type",
								"title": "The Type Schema",
								"description": "The location where the point load is located. 'n' = located on a node. 'm' = located somewhere along the member.",
								"type": "string",
								"enum": [
									"N",
									"M",
									"n",
									"m"
								]
							},
							"node": {
								"$id": "#/properties/point_loads/properties/instance/properties/node",
								"title": "The Node Schema",
								"description": "Contextual. Only include the property 'node' if applying the point load to a node. The value should be the node ID.",
								"type": [
									"integer",
									"string",
									"null"
								],
								"minimum": 1
							},
							"member": {
								"$id": "#/properties/point_loads/properties/instance/properties/member",
								"title": "The Member Schema",
								"description": "Contextual. Only include the property 'member'if applying the point load somewhere along a member. The value should be the member ID.",
								"type": [
									"integer",
									"string",
									"null"
								],
								"minimum": 1
							},
							"position": {
								"$id": "#/properties/point_loads/properties/instance/properties/position",
								"title": "The Position Schema",
								"description": "Contextual. Only include the property 'position' if applying the point load somewhere along a member. This is the position along the member where the point load is applied, measured as a percentage along the member.",
								"type": [
									"number",
									"null"
								],
								"minimum": 0,
								"maximum": 100,
								"examples": [
									30
								]
							},
							"x_mag": {
								"$id": "#/properties/point_loads/properties/instance/properties/x_mag",
								"title": "The X_mag Schema",
								"description": "The magnitude of the point load force along x axis.",
								"default": 0,
								"type": "number"
							},
							"y_mag": {
								"$id": "#/properties/point_loads/properties/instance/properties/y_mag",
								"title": "The Y_mag Schema",
								"description": "The magnitude of the point load force along y axis.",
								"default": 0,
								"type": "number"
							},
							"z_mag": {
								"$id": "#/properties/point_loads/properties/instance/properties/z_mag",
								"title": "The Z_mag Schema",
								"description": "The magnitude of the point load force along z axis.",
								"default": 0,
								"type": "number"
							},
							"load_group": {
								"$id": "#/properties/point_loads/properties/instance/properties/load_group",
								"title": "The Load_group Schema",
								"description": "The load group which the point load is to be grouped to.",
								"type": "string"
							},
							"user_data": {}
						}
					}
				},
				"additionalProperties": false
			},
			"moments": {
				"$id": "#/properties/moments",
				"title": "The moments Schema",
				"description": "Each moment is defined by an object with properties depending on the location that the point load is applied. Moments are defined by their location type (node or member), magnitude, and load group.",
				"type": "object",
				"patternProperties": {
					"^[1-9][0-9]*$": {
						"$id": "#/properties/moments/properties/instance",
						"title": "The Moments Instance Schema",
						"type": "object",
						"required": [
							"type",
							"x_mag",
							"y_mag",
							"z_mag",
							"load_group"
						],
						"properties": {
							"type": {
								"$id": "#/properties/moments/properties/instance/properties/type",
								"title": "The type Schema",
								"description": "The location where the point load is located. 'n' = located on a node. 'm' = located somewhere along the member.",
								"type": "string",
								"pattern": "(n|N|m|M)?"
							},
							"node": {
								"$id": "#/properties/moments/properties/instance/properties/node",
								"title": "The node Schema",
								"description": "Contextual. Only include the property 'node' if applying the moment to a node. The value should be the node ID.",
								"type": [
									"integer",
									"string",
									"null"
								],
								"minimum": 1
							},
							"member": {
								"$id": "#/properties/moments/properties/instance/properties/member",
								"title": "The member Schema",
								"description": "Contextual. Only include the property 'member' if applying the moment somewhere along a member. The value should be the member ID.",
								"type": [
									"integer",
									"string",
									"null"
								],
								"minimum": 1
							},
							"position": {
								"$id": "#/properties/moments/properties/instance/properties/position",
								"title": "The position Schema",
								"description": "Contextual. Only include the property 'position' if applying the moment somewhere along a member. This is the position along the member where the moment is applied, measured as a percentage along the member.",
								"type": [
									"number",
									"null"
								],
								"minimum": 0,
								"maximum": 100,
								"examples": [
									30
								]
							},
							"x_mag": {
								"$id": "#/properties/moments/properties/instance/properties/x_mag",
								"title": "The x_mag Schema",
								"description": "The magnitude of the moment about the x axis. Positive = counter-clockwise, negative = clockwise.",
								"type": "number"
							},
							"y_mag": {
								"$id": "#/properties/moments/properties/instance/properties/y_mag",
								"title": "The y_mag Schema",
								"description": "The magnitude of the moment about the y axis. Positive = counter-clockwise, negative = clockwise.",
								"default": 0,
								"type": "number"
							},
							"z_mag": {
								"$id": "#/properties/moments/properties/instance/properties/z_mag",
								"title": "The z_mag Schema",
								"description": "The magnitude of the moment about the z axis. Positive = counter-clockwise, negative = clockwise.",
								"default": 0,
								"type": "number"
							},
							"load_group": {
								"$id": "#/properties/moments/properties/instance/properties/load_group",
								"title": "The Load_group Schema",
								"description": "The load group which the point load is to be grouped to.",
								"type": "string"
							},
							"user_data": {}
						}
					}
				},
				"additionalProperties": false
			},
			"distributed_loads": {
				"$id": "#/properties/distributed_loads",
				"title": "The distributed_loads Schema",
				"description": "Each distributed load is defined by an object with properties. Distributed loads are defined by their location type (node or member), magnitude, and load group.",
				"type": "object",
				"patternProperties": {
					"^[1-9][0-9]*$": {
						"$id": "#/properties/distributed_loads/properties/instance",
						"title": "The Distributed Loads Instance Schema",
						"type": "object",
						"required": [
							"member",
							"x_mag_A",
							"y_mag_A",
							"z_mag_A",
							"x_mag_B",
							"y_mag_B",
							"z_mag_B",
							"position_A",
							"position_B",
							"load_group",
							"axes"
						],
						"properties": {
							"member": {
								"$id": "#/properties/distributed_loads/properties/instance/properties/member",
								"title": "The member Schema",
								"description": "Member where the distributed load is applied. Identified by the member ID.",
								"type": [
									"integer",
									"string"
								],
								"minimum": 1
							},
							"x_mag_A": {
								"$id": "#/properties/distributed_loads/properties/instance/properties/x_mag_A",
								"title": "The x_mag_A Schema",
								"description": "Magnitude of load in x direction at the starting position A.",
								"default": 0,
								"type": "number"
							},
							"y_mag_A": {
								"$id": "#/properties/distributed_loads/properties/instance/properties/y_mag_A",
								"title": "The y_mag_A Schema",
								"description": "Magnitude of load in y direction at the starting position A.",
								"default": 0,
								"type": "number"
							},
							"z_mag_A": {
								"$id": "#/properties/distributed_loads/properties/instance/properties/z_mag_A",
								"title": "The z_mag_A Schema",
								"description": "Magnitude of load in z direction at the starting position A.",
								"default": 0,
								"type": "number"
							},
							"x_mag_B": {
								"$id": "#/properties/distributed_loads/properties/instance/properties/x_mag_B",
								"title": "The x_mag_B Schema",
								"description": "Magnitude of load in x direction at the finish position B.",
								"default": 0,
								"type": "number"
							},
							"y_mag_B": {
								"$id": "#/properties/distributed_loads/properties/instance/properties/y_mag_B",
								"title": "The y_mag_B Schema",
								"description": "Magnitude of load in y direction at the finish position B.",
								"type": "number"
							},
							"z_mag_B": {
								"$id": "#/properties/distributed_loads/properties/instance/properties/z_mag_B",
								"title": "The z_mag_B Schema",
								"description": "Magnitude of load in z direction at the finish position B.",
								"default": 0,
								"type": "number"
							},
							"position_A": {
								"$id": "#/properties/distributed_loads/properties/instance/properties/position_A",
								"title": "The position_A Schema",
								"description": "Position along member where the distributed load starts. Expressed as a percentage.",
								"type": [
									"number",
									"null"
								],
								"minimum": 0,
								"maximum": 100,
								"examples": [
									30
								]
							},
							"position_B": {
								"$id": "#/properties/distributed_loads/properties/instance/properties/position_B",
								"title": "The position_b Schema",
								"description": "Position along member where the distributed load ends. Expressed as a percentage.",
								"type": [
									"number",
									"null"
								],
								"minimum": 0,
								"maximum": 100,
								"examples": [
									30
								]
							},
							"load_group": {
								"$id": "#/properties/distributed_loads/properties/instance/properties/load_group",
								"title": "The load_group Schema",
								"description": "The load group which the load belongs.",
								"type": "string"
							},
							"axes": {
								"$id": "#/properties/distributed_loads/properties/instance/properties/axes",
								"title": "The axes Schema",
								"description": "Specify either 'global', 'global_projected' or 'local' to assign which axes are to be used to apply the distributed load.",
								"type": "string",
								"default": "global",
								"enum": [
									"global",
									"global_projected",
									"local",
									"Global",
									"Global_projected",
									"Local"
								]
							},
							"user_data": {}
						}
					}
				},
				"additionalProperties": false
			},
			"pressures": {
				"$id": "#/properties/pressures",
				"title": "The pressures Schema",
				"description": "Each pressure is defined by an object with properties. Pressures are defined by the plate ID they are applied to, the reference axes, magnitude and load group.",
				"type": "object",
				"patternProperties": {
					"^[1-9][0-9]*$": {
						"$id": "#/properties/pressures/properties/instance",
						"title": "The Pressures Instance Schema",
						"type": "object",
						"required": [
							"plate_id",
							"axes",
							"x_mag",
							"y_mag",
							"z_mag",
							"load_group"
						],
						"if": {
							"properties": {
								"load_distribution": {
									"const": "linear"
								}
							}
						},
						"then": {
							"properties": {
								"load_direction": {
									"$id": "#/properties/pressures/properties/instance/properties/load_direction",
									"title": "The load_direction Schema",
									"description": "Direction of the load is 'X', 'Y' or 'Z'.",
									"default": "Y",
									"type": "string",
									"pattern": "^(X|Y|Z)$"
								},
								"p1_point_id": {
									"$id": "#/properties/pressures/properties/instance/properties/p1_point_id",
									"title": "The p1_point_id Schema",
									"description": "Node ID of point P1 of linear pressure.",
									"type": [
										"integer",
										"string"
									]
								},
								"p1_magnitude": {
									"$id": "#/properties/pressures/properties/instance/properties/p1_magnitude",
									"title": "The p1_magnitude Schema",
									"description": "Magnitude at P1 for linear pressure.",
									"default": 0,
									"type": "number"
								},
								"p2_point_id": {
									"$id": "#/properties/pressures/properties/instance/properties/p2_point_id",
									"title": "The p2_point_id Schema",
									"description": "Node ID of point P2 of linear pressure.",
									"type": [
										"integer",
										"string"
									]
								},
								"p2_magnitude": {
									"$id": "#/properties/pressures/properties/instance/properties/p2_magnitude",
									"title": "The p2_magnitude Schema",
									"description": "Magnitude at P2 for linear pressure.",
									"default": 0,
									"type": "number"
								},
								"p3_point_id": {
									"$id": "#/properties/pressures/properties/instance/properties/p3_point_id",
									"title": "The p3_point_id Schema",
									"description": "Node ID of point P3 of linear pressure.",
									"type": [
										"integer",
										"string"
									]
								},
								"p3_magnitude": {
									"$id": "#/properties/pressures/properties/instance/properties/p3_magnitude",
									"title": "The p3_magnitude Schema",
									"description": "Magnitude at P3 for linear pressure.",
									"default": 0,
									"type": "number"
								}
							}
						},
						"properties": {
							"plate_id": {
								"$id": "#/properties/pressures/properties/instance/properties/plate_id",
								"title": "The plate_id Schema",
								"description": "Plate where the pressure is applied. Identified by the plate ID.",
								"type": [
									"integer",
									"string"
								],
								"minimum": 1,
								"pattern": "^(.+)$"
							},
							"axes": {
								"$id": "#/properties/pressures/properties/instance/properties/axes",
								"title": "The axes Schema",
								"description": "Specify either 'global', 'global_projected' or 'local' to assign which axes are to be used to apply the pressure load.",
								"type": "string",
								"default": "global",
								"enum": [
									"global",
									"global_projected",
									"local",
									"Global",
									"Global_projected",
									"Local"
								]
							},
							"x_mag": {
								"$id": "#/properties/pressures/properties/instance/properties/x_mag",
								"title": "The x_mag Schema",
								"description": "Magnitude of pressure in x direction, dependent on local or global axes setting.",
								"default": 0,
								"type": "number"
							},
							"y_mag": {
								"$id": "#/properties/pressures/properties/instance/properties/y_mag",
								"title": "The y_mag Schema",
								"description": "Magnitude of pressure in y direction, dependent on local or global axes setting.",
								"default": 0,
								"type": "number"
							},
							"z_mag": {
								"$id": "#/properties/pressures/properties/instance/properties/z_mag",
								"title": "The z_mag Schema",
								"description": "Magnitude of pressure in z direction, dependent on local or global axes setting.",
								"default": 0,
								"type": "number"
							},
							"load_group": {
								"$id": "#/properties/pressures/properties/instance/properties/load_group",
								"title": "The load_group Schema",
								"description": "The load group which the load belongs.",
								"type": "string"
							},
							"load_distribution": {
								"$id": "#/properties/pressures/properties/instance/properties/load_distribution",
								"title": "The load_distribution Schema",
								"description": "Select between 'linear' and 'uniform' distribution.",
								"default": "uniform",
								"type": "string",
								"enum": [
									"uniform",
									"linear"
								]
							},
							"user_data": {}
						}
					}
				},
				"additionalProperties": false
			},
			"area_loads": {
				"$id": "#/properties/area_loads",
				"title": "The area_loads Schema",
				"description": "Each area load is defined by an object with properties.",
				"type": "object",
				"patternProperties": {
					"^(.+)$": {
						"$id": "#/properties/area_loads/properties/instance",
						"title": "The Area Load Instance Schema",
						"type": "object",
						"required": [
							"type",
							"nodes"
						],
						"if": {
							"properties": {
								"type": {
									"const": "column_wind_load"
								}
							}
						},
						"then": {
							"properties": {
								"mags": {
									"$id": "#/properties/area_loads/properties/instance/properties/mags",
									"title": "The mags Schema",
									"description": "Comma-seperated list of magnitudes matching the number of elevations in the load.",
									"type": [
										"string",
										"number",
										"array"
									],
									"if": {
										"type": "string"
									},
									"then": {
										"pattern": "^-?(\\d+(\\.\\d+)?|\\.\\d+)(,-?(\\d+(\\.\\d+)?|\\.\\d+))*$",
										"errorMessage": {
											"pattern": "should be number or a comma-seperated list of numbers eg. '1.2' or '0.2,0.5'"
										}
									},
									"items": {
										"type": "number"
									}
								}
							}
						},
						"else": {
							"properties": {
								"mag": {
									"$id": "#/properties/area_loads/properties/instance/properties/mag",
									"title": "The mag Schema",
									"description": "The pressure magnitude.",
									"type": [
										"number",
										"null"
									]
								},
								"direction": {
									"$id": "#/properties/area_loads/properties/instance/properties/direction",
									"title": "The direction Schema",
									"description": "The direction of the pressure force.",
									"type": [
										"string",
										"null"
									],
									"if": {
										"type": "string"
									},
									"then": {
										"enum": [
											"X",
											"X_projected",
											"Y",
											"Y_projected",
											"Z",
											"Z_projected",
											"local"
										]
									}
								}
							}
						},
						"properties": {
							"type": {
								"$id": "#/properties/area_loads/properties/instance/properties/type",
								"title": "The type Schema",
								"description": "This area load instance's type.",
								"type": "string",
								"enum": [
									"one_way",
									"two_way",
									"column_wind_load",
									"open_structure",
									"non_rectangular",
									"general_one_way"
								]
							},
							"nodes": {
								"$id": "#/properties/area_loads/properties/instance/properties/nodes",
								"title": "The nodes Schema",
								"description": "The nodes comprising the area_load.",
								"type": [
									"array",
									"string"
								],
								"examples": [
									"4,5,7,6"
								],
								"pattern": "^(.+)$",
								"items": {
									"type": [
										"integer",
										"string"
									]
								},
								"errorMessage": {
									"pattern": "should be a comma-seperated list of 4 nodes eg. '1,2,3,4'"
								}
							},
							"elevations": {
								"$id": "#/properties/area_loads/properties/instance/properties/elevations",
								"title": "The elevations Schema",
								"description": "Comma-seperated list of elevations in feet or metres for wind loads.",
								"type": [
									"string",
									"number",
									"array",
									"null"
								],
								"pattern": "^(\\d+(\\.\\d+)?|\\.\\d+)(,(\\d+(\\.\\d+)?|\\.\\d+))*$",
								"items": {
									"type": "number"
								},
								"errorMessage": {
									"pattern": "should be a comma-seperated list of numbers eg. '1,1.3'"
								}
							},
							"column_direction": {
								"$id": "#/properties/area_loads/properties/instance/properties/column_direction",
								"title": "The column_direction Schema",
								"description": "The direction of your internal beams or columns. Enter two comma-seperated nodes e.g. 1,2. This would distribute the area loads along members in this direction.",
								"type": [
									"string",
									"array",
									"null"
								],
								"pattern": "(.)+",
								"items": {
									"type": [
										"integer",
										"string"
									]
								},
								"minItems": 2,
								"maxItems": 2,
								"errorMessage": {
									"pattern": "should be a comma-seperated list of 2 nodes indicating direction of load distribution eg. '1,2'"
								}
							},
							"loaded_members_axis": {
								"$id": "#/properties/area_loads/properties/instance/properties/loaded_members_axis",
								"title": "The loaded_members_axis Schema",
								"description": "Pick up and apply loads to all members within corner nodes, or members along X,Y,Z axis only.",
								"type": [
									"string",
									"null"
								],
								"if": {
									"type": "string"
								},
								"then": {
									"enum": [
										"all",
										"major"
									]
								}
							},
							"user_data": {},
							"intervals": {
								"$id": "#/properties/area_loads/properties/instance/properties/intervals",
								"title": "The intervals Schema",
								"description": "general_one_way only. Comma-separated step-interval distances, n + 1 values matching n values in mags. Blank = uniform load.",
								"type": [
									"string",
									"array",
									"null"
								]
							},
							"excluded_member_ids": {
								"$id": "#/properties/area_loads/properties/instance/properties/excluded_member_ids",
								"title": "The excluded_member_ids Schema",
								"description": "general_one_way only. Comma-separated member IDs to exclude from carrying the load.",
								"type": [
									"string",
									"array",
									"null"
								]
							},
							"exclude_internal_members": {
								"$id": "#/properties/area_loads/properties/instance/properties/exclude_internal_members",
								"title": "The exclude_internal_members Schema",
								"description": "general_one_way only. 'off', 'angled', or 'all': auto-excludes internal members not aligned to the span.",
								"type": [
									"string",
									"null"
								],
								"enum": [
									"off",
									"angled",
									"all",
									null
								]
							},
							"cantilever_extensions": {
								"$id": "#/properties/area_loads/properties/instance/properties/cantilever_extensions",
								"title": "The cantilever_extensions Schema",
								"description": "general_one_way only. 'left,right' offsets extending the load polygon along the span to pick up cantilevered members.",
								"type": [
									"string",
									"null"
								]
							},
							"distributed_moments": {
								"$id": "#/properties/area_loads/properties/instance/properties/distributed_moments",
								"title": "The distributed_moments Schema",
								"description": "Distributed moments applied as part of this area load.",
								"type": [
									"array",
									"null"
								]
							},
							"members": {
								"$id": "#/properties/area_loads/properties/instance/properties/members",
								"title": "The members Schema",
								"description": "Member count/reference associated with the generated two-way plate load distribution.",
								"type": [
									"integer",
									"number",
									"string",
									"null"
								]
							},
							"elevation_direction": {
								"$id": "#/properties/area_loads/properties/instance/properties/elevation_direction",
								"title": "The elevation_direction Schema",
								"description": "The direction used to interpret elevations for this area load.",
								"type": [
									"string",
									"null"
								]
							},
							"plate_material_id": {
								"$id": "#/properties/area_loads/properties/instance/properties/plate_material_id",
								"title": "The plate_material_id Schema",
								"description": "Material ID assigned to plates auto-generated from this area load.",
								"type": [
									"integer",
									"string",
									"null"
								]
							},
							"plate_thickness": {
								"$id": "#/properties/area_loads/properties/instance/properties/plate_thickness",
								"title": "The plate_thickness Schema",
								"description": "Thickness assigned to plates auto-generated from this area load.",
								"type": [
									"number",
									"string",
									"null"
								]
							},
							"plate_torsion": {
								"$id": "#/properties/area_loads/properties/instance/properties/plate_torsion",
								"title": "The plate_torsion Schema",
								"description": "Whether torsion is considered for plates auto-generated from this area load.",
								"type": [
									"string",
									"null"
								],
								"enum": [
									"yes",
									"no",
									null
								]
							},
							"plate_rotation": {
								"$id": "#/properties/area_loads/properties/instance/properties/plate_rotation",
								"title": "The plate_rotation Schema",
								"description": "Rotation (about local Z) assigned to plates auto-generated from this area load.",
								"type": [
									"number",
									"string",
									"null"
								]
							},
							"number_of_segments": {
								"$id": "#/properties/area_loads/properties/instance/properties/number_of_segments",
								"title": "The number_of_segments Schema",
								"description": "Number of segments used to discretize plates auto-generated from this area load.",
								"type": [
									"integer",
									"string",
									"null"
								]
							}
						},
						"patternProperties": {
							"LG|load_group": {
								"$id": "#/properties/area_loads/properties/instance/properties/LG",
								"title": "The LG Schema",
								"description": "The load group to which this load belongs.",
								"type": "string",
								"pattern": "^(.+)$"
							}
						}
					}
				},
				"additionalProperties": false
			},
			"member_prestress_loads": {
				"$id": "#/properties/member_prestress_loads",
				"title": "The member_prestress_loads Schema",
				"type": "object",
				"patternProperties": {
					"^[1-9][0-9]*$": {
						"$id": "#/properties/member_prestress_loads/instance",
						"title": "The Member Prestress Load Instance Schema",
						"required": [
							"load_group",
							"member_id",
							"prestress_magnitude"
						],
						"$comment": "'id' must be pattern property. Conflicts with $id",
						"patternProperties": {
							"id": {
								"type": "integer",
								"minimum": 1
							}
						},
						"properties": {
							"load_group": {
								"type": "string",
								"pattern": "^(.+)$"
							},
							"member_id": {
								"type": [
									"integer",
									"string"
								],
								"minimum": 1
							},
							"prestress_magnitude": {
								"type": "number"
							}
						}
					}
				},
				"additionalProperties": false
			},
			"self_weight": {
				"$id": "#/properties/self_weight",
				"title": "The self_weight Schema",
				"description": "The self weight is an object defined by properties. It can be optionally enabled and applied a gravity multiplier in the x, y, or z axes. Supports the legacy {enabled,x,y,z,LG} format and the simplified {direction,factor,LG} format.",
				"type": "object",
				"if": {
					"required": [
						"x"
					]
				},
				"then": {
					"required": [
						"x",
						"y",
						"z"
					],
					"properties": {
						"enabled": {
							"$id": "#/properties/self_weight/properties/enabled",
							"title": "The Enabled Schema",
							"description": "true = self weight enabled. false = self weight disabled",
							"type": "boolean",
							"default": false
						},
						"x": {
							"$id": "#/properties/self_weight/properties/x",
							"title": "The x Schema",
							"description": "Acceleration due to gravity in the x axis measured in g's",
							"default": 0,
							"type": "number"
						},
						"y": {
							"$id": "#/properties/self_weight/properties/y",
							"title": "The y Schema",
							"description": "Acceleration due to gravity in the y axis measured in g's",
							"default": 0,
							"type": "number"
						},
						"z": {
							"$id": "#/properties/self_weight/properties/z",
							"title": "The z Schema",
							"description": "Acceleration due to gravity in the z axis measured in g's",
							"default": 0,
							"type": "number"
						},
						"LG": {
							"description": "The Load Group to which the self weight belongs.",
							"type": "string",
							"pattern": "^SW[1-9]+[0-9]*$",
							"errorMessage": {
								"pattern": "should follow pattern \"SW\" followed by integer greater than 0 eg: \"SW2\"."
							}
						},
						"load_group": {
							"description": "The Load Group to which the self weight belongs.",
							"type": "string",
							"pattern": "^SW[1-9]+[0-9]*$",
							"errorMessage": {
								"pattern": "should follow pattern \"SW\" followed by integer greater than 0 eg: \"SW2\"."
							}
						},
						"user_data": {}
					},
					"additionalProperties": false
				},
				"else": {
					"if": {
						"required": [
							"direction"
						]
					},
					"then": {
						"type": "object",
						"required": [
							"direction",
							"factor"
						],
						"properties": {
							"direction": {
								"type": "string",
								"enum": [
									"X",
									"Y",
									"Z"
								],
								"description": "The axis along which self weight gravity acts."
							},
							"factor": {
								"type": "number",
								"description": "Gravity multiplier applied in the given direction (e.g. -1 for standard downward gravity)."
							},
							"LG": {
								"type": "string",
								"pattern": "^SW[0-9]*$",
								"description": "The Load Group to which the self weight belongs. May be 'SW' alone (single self-weight case) or 'SW' followed by a number for multiple cases.",
								"errorMessage": {
									"pattern": "should be 'SW' optionally followed by an integer, eg. 'SW' or 'SW2'."
								}
							},
							"load_group": {
								"type": "string",
								"pattern": "^SW[0-9]*$",
								"errorMessage": {
									"pattern": "should be 'SW' optionally followed by an integer, eg. 'SW' or 'SW2'."
								}
							},
							"user_data": {}
						},
						"additionalProperties": false
					},
					"else": {
						"patternProperties": {
							"^[1-9][0-9]*$": {
								"required": [
									"x",
									"y",
									"z"
								],
								"properties": {
									"enabled": {
										"$id": "#/properties/self_weight/instance/properties/enabled",
										"title": "The Enabled Schema",
										"description": "true = self weight enabled. false = self weight disabled",
										"type": "boolean",
										"default": false
									},
									"x": {
										"$id": "#/properties/self_weight/instance/properties/x",
										"title": "The x Schema",
										"description": "Acceleration due to gravity in the x axis measured in g's",
										"default": 0,
										"type": "number"
									},
									"y": {
										"$id": "#/properties/self_weight/instance/properties/y",
										"title": "The y Schema",
										"description": "Acceleration due to gravity in the y axis measured in g's",
										"default": 0,
										"type": "number"
									},
									"z": {
										"$id": "#/properties/self_weight/instance/properties/z",
										"title": "The z Schema",
										"description": "Acceleration due to gravity in the z axis measured in g's",
										"default": 0,
										"type": "number"
									},
									"LG": {
										"description": "The Load Group to which the self weight belongs.",
										"type": "string",
										"pattern": "^SW[0-9]*$",
										"errorMessage": {
											"pattern": "should follow pattern \"SW\" followed by integer greater than 0 eg: \"SW2\"."
										}
									},
									"load_group": {
										"description": "The Load Group to which the self weight belongs.",
										"type": "string",
										"pattern": "^SW[0-9]*$",
										"errorMessage": {
											"pattern": "should follow pattern \"SW\" followed by integer greater than 0 eg: \"SW2\"."
										}
									},
									"name": {
										"description": "Legacy label for this self weight load case (older API format).",
										"type": "string"
									},
									"user_data": {}
								},
								"additionalProperties": false
							}
						}
					}
				}
			},
			"load_combinations": {
				"$id": "#/properties/load_combinations",
				"title": "The load_combinations Schema",
				"description": "Load combinations are assigned to forces and moments as a property in their objects. The load combinations object is used to assign a multiplier to each load combination defined",
				"type": "object",
				"patternProperties": {
					"^[1-9][0-9]*$": {
						"$id": "#/properties/load_combinations/instance/properties/instance",
						"title": "The Load Combinations Instance Schema",
						"type": "object",
						"properties": {
							"name": {
								"$id": "#/properties/load_combinations/instance/properties/name",
								"title": "The Load Combination Name Schema",
								"type": "string"
							},
							"user_data": {},
							"criteria": {
								"$id": "#/properties/load_combinations/instance/properties/criteria",
								"title": "The criteria Schema",
								"type": "string",
								"enum": [
									"strength",
									"serviceability",
									"other"
								],
								"description": "Whether this load combination is intended for strength design, serviceability checks, or other purposes."
							}
						},
						"patternProperties": {
							"^(SW)[1-9][0-9]*$": {
								"$id": "#/properties/load_combinations/instance/pattern_properties/sw",
								"title": "The SW1 Schema",
								"type": "number"
							},
							"^(?!name$)(?!criteria$)(?!user_data$)(.+)$": {
								"$id": "#/properties/load_combinations/instance/pattern_properties/lg",
								"title": "The LG Schema",
								"description": "This is the Load Group Factor. Do not confuse with Load Group Name!",
								"type": "number"
							}
						}
					}
				},
				"properties": {
					"import": {
						"properties": {
							"design_code": {
								"type": "string",
								"enum": [
									"EN",
									"ASCE",
									"AS1170",
									"NBCC",
									"ACI"
								]
							},
							"expand_wind_loads": {
								"type": "boolean"
							}
						}
					}
				},
				"additionalProperties": false
			},
			"nodal_masses": {
				"$id": "#/properties/nodal_masses",
				"title": "The nodal_masses Schema",
				"type": "object",
				"patternProperties": {
					"^[1-9][0-9]*$": {
						"$id": "#/properties/nodal_masses/properties/instance",
						"title": "The Nodal Masses Instance Schema",
						"type": "object",
						"properties": {
							"node_id": {
								"type": [
									"integer",
									"string"
								],
								"minimum": 1
							},
							"tx_mass": {
								"type": "number",
								"minimum": 0
							},
							"ty_mass": {
								"type": "number",
								"minimum": 0
							},
							"tz_mass": {
								"type": "number",
								"minimum": 0
							},
							"rx_mass": {
								"type": "number",
								"minimum": 0
							},
							"ry_mass": {
								"type": "number",
								"minimum": 0
							},
							"rz_mass": {
								"type": "number",
								"minimum": 0
							},
							"source": {
								"type": "string",
								"description": "Indicates how the nodal mass was generated, e.g. 'User Defined'."
							}
						}
					}
				},
				"additionalProperties": false
			},
			"nodal_masses_conversion_map": {
				"$id": "#/properties/nodal_masses_conversion_map",
				"title": "The nodal_masses_conversion_map Schema",
				"type": "object",
				"patternProperties": {
					"^(.+)$": {
						"$id": "#/properties/nodal_masses_conversion_map/properties/instance",
						"title": "The Nodal Masses Conversion Map Instance Schema",
						"required": [
							"factor",
							"direction"
						],
						"properties": {
							"factor": {
								"type": "number",
								"except": [
									0
								]
							},
							"direction": {
								"type": "string",
								"enum": [
									"X,Y,Z",
									"X,Y",
									"X,Z",
									"Y,Z",
									"X",
									"Y",
									"Z"
								]
							}
						}
					}
				},
				"additionalProperties": false
			},
			"spectral_loads": {
				"$id": "#/properties/spectral_loads",
				"title": "The spectral_loads Schema",
				"description": "Each spectral load is defined by an object with properties.",
				"type": "object",
				"patternProperties": {
					"^[1-9][0-9]*$": {
						"$id": "#/properties/spectral_loads/properties/instance",
						"title": "The Spectral Load Instance Schema",
						"type": "object",
						"required": [
							"input_method"
						],
						"properties": {
							"input_method": {
								"$id": "#/properties/spectral_loads/properties/instance/properties/input_method",
								"description": "'1' if the load was generated via 'user input'. '2' if by 'design code'",
								"type": "integer",
								"enum": [
									1,
									2
								]
							},
							"design_code": {
								"$id": "#/properties/spectral_loads/properties/instance/properties/design_code",
								"description": "The selected design code if the load was generated via design code.",
								"type": [
									"string",
									"null"
								],
								"enum": [
									"EN8",
									"ASCE",
									"",
									null
								]
							},
							"design_data": {
								"$id": "#/properties/spectral_loads/properties/instance/properties/design_data",
								"title": "The design_data Schema",
								"properties": {
									"saved": {
										"type": "boolean"
									},
									"rs_type": {
										"title": "The Response Spectrum Schema",
										"type": "string",
										"enum": [
											"type_1",
											"type_2"
										]
									},
									"rs_dir": {
										"title": "The Response Spectrum Type Schema",
										"type": "string",
										"enum": [
											"el_horizontal",
											"el_vertical",
											"des_horizontal",
											"des_vertical"
										]
									},
									"rs_peak": {
										"title": "The Peak Ground Acceleration Schema",
										"type": "number",
										"exclusiveMinimum": 0
									},
									"rs_imp_fac": {
										"title": "The Response Spectrum Importance Factor Schema",
										"type": "number",
										"minimum": 0
									},
									"rs_ground": {
										"title": "The Response Spectrum Ground Type Schema",
										"type": "string",
										"enum": [
											"A",
											"B",
											"C",
											"D",
											"E"
										]
									},
									"rs_damp": {
										"title": "The Response Spectrum Damping Schema",
										"type": "number",
										"exclusiveMinimum": 0
									},
									"max_T": {
										"title": "The Maximum Period (Secs) Schema",
										"type": "number",
										"exclusiveMinimum": 0
									},
									"beta": {
										"title": "The Lower Bound Factor Schema",
										"type": "number",
										"exclusiveMinimum": 0
									},
									"q_fac": {
										"title": "The Behavior Factor Schema",
										"type": "number",
										"exclusiveMinimum": 0
									}
								}
							},
							"xy_data": {
								"$id": "#/properties/spectral_loads/properties/instance/properties/xy_data",
								"description": "Values for the XY plot in pairs { Period T (X), Spectral Value (Y) }",
								"type": "array",
								"items": {
									"type": "object",
									"required": [
										"x",
										"y"
									],
									"properties": {
										"x": {
											"type": "number"
										},
										"y": {
											"type": "number"
										}
									},
									"additionalProperties": false
								}
							},
							"load_dir": {
								"$id": "#/properties/spectral_loads/properties/instance/properties/load_dir",
								"description": "Direction of the load.",
								"type": "string",
								"enum": [
									"X",
									"Z",
									"XZ",
									"Y"
								]
							},
							"load_angle": {
								"$id": "#/properties/spectral_loads/properties/instance/properties/load_angle",
								"description": "Angle of the load if 'XZ' was chosen for direction.",
								"type": "number",
								"minimum": 0,
								"maximum": 360
							},
							"load_factor": {
								"$id": "#/properties/spectral_loads/properties/instance/properties/load_factor",
								"description": "Factor multiplier for the load.",
								"type": "number"
							},
							"load_combo_method": {
								"$id": "#/properties/spectral_loads/properties/instance/properties/load_combo_method",
								"description": "Method used to calculate the impact of load combinations.",
								"type": "string",
								"enum": [
									"CQC",
									"ABS",
									"SRSS",
									"Linear"
								]
							},
							"load_damping_ratio": {
								"$id": "#/properties/spectral_loads/properties/instance/properties/load_damping_ratio",
								"type": "number"
							},
							"LG": {
								"$id": "#/properties/spectral_loads/properties/instance/properties/lg",
								"description": "The load group this load belongs to",
								"pattern": "^(.+)$"
							},
							"save_sign": {
								"$id": "#/properties/spectral_loads/properties/instance/properties/save_sign",
								"description": "Whether to preserve the sign of results when combining modal responses.",
								"type": "string",
								"enum": [
									"yes",
									"no"
								]
							}
						}
					}
				},
				"additionalProperties": false
			},
			"thermal_loads": {
				"$id": "#/properties/thermal_loads",
				"title": "The thermal_loads Schema",
				"description": "Each thermal load is defined by an object with properties, applying a temperature change to a member or plate.",
				"type": "object",
				"patternProperties": {
					"^(.+)$": {
						"$id": "#/properties/thermal_loads/properties/instance",
						"title": "The Thermal Load Instance Schema",
						"type": "object",
						"properties": {
							"element_type": {
								"type": "string",
								"enum": [
									"member",
									"plate"
								],
								"description": "The type of element this thermal load is applied to."
							},
							"element_id": {
								"type": [
									"integer",
									"string"
								],
								"minimum": 1,
								"description": "The ID of the member or plate this thermal load is applied to."
							},
							"thermal_load": {
								"type": "number",
								"description": "The temperature change applied by this thermal load."
							},
							"load_group": {
								"type": "string",
								"pattern": "^(.+)$",
								"description": "The load group to which this load belongs."
							},
							"user_data": {}
						}
					}
				},
				"additionalProperties": false
			},
			"moving_loads": {
				"$id": "#/properties/moving_loads",
				"title": "The moving_loads Schema",
				"description": "Moving/vehicle load definitions, comprising traffic lines, vehicle loads, and generated load cases.",
				"type": "object",
				"properties": {
					"traffic_lines": {
						"$id": "#/properties/moving_loads/properties/traffic_lines",
						"title": "The traffic_lines Schema",
						"description": "Traffic lines defining paths along which vehicle loads travel across members.",
						"type": "object",
						"patternProperties": {
							"^(.+)$": {
								"type": "object"
							}
						}
					},
					"vehicle_loads": {
						"$id": "#/properties/moving_loads/properties/vehicle_loads",
						"title": "The vehicle_loads Schema",
						"description": "Vehicle load definitions (axle spacings, weights, etc.) applied to traffic lines.",
						"type": "object",
						"patternProperties": {
							"^(.+)$": {
								"type": "object"
							}
						}
					},
					"cases": {
						"$id": "#/properties/moving_loads/properties/cases",
						"title": "The cases Schema",
						"description": "Generated moving load cases combining vehicle loads with traffic lines.",
						"type": "object",
						"patternProperties": {
							"^(.+)$": {
								"type": "object"
							}
						}
					}
				}
			},
			"suppress": {
				"$id": "#/properties/suppress",
				"title": "The suppress Schema",
				"description": "Tracks which model elements are suppressed (hidden from analysis) per named suppression set, plus the currently active set.",
				"type": "object",
				"properties": {
					"current_case": {
						"type": "string",
						"description": "The name of the currently active suppression set."
					}
				},
				"patternProperties": {
					"^(?!current_case$)(.+)$": {
						"$id": "#/properties/suppress/properties/instance",
						"title": "The Suppress Set Instance Schema",
						"type": "object",
						"description": "A named suppression set. Each property is an array of suppressed IDs for that element collection.",
						"properties": {
							"members": {
								"type": "array"
							},
							"plates": {
								"type": "array"
							},
							"supports": {
								"type": "array"
							},
							"moments": {
								"type": "array"
							},
							"distributed_loads": {
								"type": "array"
							},
							"point_loads": {
								"type": "array"
							},
							"area_loads": {
								"type": "array"
							},
							"pressures": {
								"type": "array"
							},
							"load_combinations": {
								"type": "array"
							}
						}
					}
				}
			},
			"load_combination_settings": {
				"$id": "#/properties/load_combination_settings",
				"title": "The load_combination_settings Schema",
				"description": "Settings controlling automatic generation of code-based load combinations from load_cases.",
				"type": "object",
				"properties": {
					"country": {
						"type": "string",
						"description": "The country associated with the selected design code."
					},
					"code": {
						"type": "string",
						"description": "The design code (and version) used to auto-generate load combinations, e.g. 'AS-1170.0-2002'."
					},
					"criteria": {
						"type": "string",
						"description": "Which combination criteria to generate, e.g. 'All'."
					},
					"filters": {
						"type": "object",
						"description": "UI filter selections used when generating load combinations."
					},
					"load_case_order": {
						"type": "array",
						"description": "The display/generation order of load group names."
					},
					"patterns": {
						"type": "object",
						"description": "Load pattern and ratio settings (e.g. simultaneous vs alternate, main/alternate ratios) used when generating combinations."
					},
					"load_case_mappings": {
						"type": "object",
						"description": "Maps short load group codes to their full descriptive load case names."
					},
					"load_case_sub_groups": {
						"type": "array",
						"description": "Sub-group assignments for load group names, used to control which load groups are combined together.",
						"items": {
							"type": "object",
							"properties": {
								"name": {
									"type": "string"
								},
								"sub_group": {
									"type": [
										"integer",
										"string"
									]
								}
							}
						}
					}
				}
			}
		}
	}
	// END S3D MODEL SCHEMA ==== Do not remove! ==============================================================

	var ajv;

	var script = document.createElement('script');
	script.onload = function () {
		var Ajv = window.ajv7.default
		ajv = new Ajv({
			allErrors: true,
			allowUnionTypes: true,
			strict: false
		})
	};
	script.src = "https://cdnjs.cloudflare.com/ajax/libs/ajv/7.0.1/ajv7.min.js";
	document.head.appendChild(script); //or something of the likes

	functions.model = function (s3d_model, log_flag) {
		if (!log_flag) log_flag = false;
		return validateModel(s3d_model, log_flag);
	}

	functions.API = function (input) {
		return validateStart(input);
	}

	var structuralChecks = {
		"sections": function (model_data) {
			var info_schema = {
				"$id": "#/properties/sections/properties/instance/type4",
				"type": "object",
				"title": "The Sections Array Schema",
				"description": "One can call a definition from the Section Database, instead of defining a Section explicitly",
				"required": [
					"info"
				],
				"properties": {
					"info": {
						"properties": {
							"selection": {
								"properties": {
									"family_code": {
										"type": [
											"string",
										],
										"pattern": "^(.)+$"
									},
									"family_name": {
										"type": [
											"string",
										],
										"pattern": "^(.)+$"
									},
									"section_name": {
										"type": [
											"string",
										],
										"pattern": "^(.)+$"
									},
									"name": {
										"type": [
											"string",
										],
										"pattern": "^(.)+$"
									}
								}
							},
							"shape": {
								"type": [
									"string"
								],
								"pattern": "^(.)+$"
							}
						}
					},
					"user_data": {}
				}
			}

			var section_builder_schema = {
				"$id": "#/properties/sections/properties/instance/type1",
				"title": "The Sections Database Schema",
				"description": "Schema for a section whose properties are explicitly defined.",
				"type": "object",
				"required": [
					"area",
					"Iz",
					"Iy",
					"J",
					"material_id"
				],
				"properties": {
					"version": {
						"$id": "#/properties/sections/properties/instance/type1/properties/version",
						"title": "The version Schema",
						"description": "The version of the 'Section Builder' that was used to construct this object.",
						"type": [
							"integer",
							"string"
						],
						"examples": [
							1
						],
						"minimum": 1,
						"pattern": "^[0-9]+$",
						"errorMessage": {
							"pattern": "should be a positive integer."
						}
					},
					"name": {
						"$id": "#/properties/sections/properties/instance/properties/type1/name",
						"title": "The name Schema",
						"description": "The name of your section. If nothing is entered, the name will default to the (rounded) height x width dimension.",
						"type": "string",
						"default": "",
						"examples": [
							"203 x 203"
						],
						"pattern": "^(.*)$"
					},
					"area": {
						"$id": "#/properties/sections/properties/instance/properties/type1/area",
						"title": "The area Schema",
						"description": "Cross sectional area.",
						"type": "number",
						"exclusiveMinimum": 0
					},
					"Iy": {
						"$id": "#/properties/sections/properties/instance/properties/type1/Iy",
						"title": "The Iy Schema",
						"description": "Area moment of inertia about the y axis.",
						"type": "number",
						"exclusiveMinimum": 0
					},
					"Iz": {
						"$id": "#/properties/sections/properties/instance/properties/type1/Iz",
						"title": "The Iz Schema",
						"description": "Area moment of inertia about the z axis.",
						"type": "number",
						"exclusiveMinimum": 0
					},
					"J": {
						"$id": "#/properties/sections/properties/instance/properties/type1/J",
						"title": "The J Schema",
						"description": "Torsion constant.",
						"type": "number",
						"exclusiveMinimum": 0
					},
					"material_id": {
						"$id": "#/properties/sections/properties/instance/properties/type1/material_id",
						"title": "The material_id Schema",
						"description": "The ID of the material that is assigned to the cross section. Materials are defined in its own object.",
						"type": "integer",
						"minimum": 1
					},
					"shear_area_z": {
						"$id": "#/properties/sections/properties/instance/properties/type1/shear_area_z",
						"title": "The shear_area_z Schema",
						"description": "Optional. Do not get confused between this property and the one with the same name within the 'aux' property. Shear Area in the Z-axis. Leave this value as Empty or Zero for a Euler-Bernoulli Beam (Recommended). Enter a value for a Timoshenko Beam (i.e. where shear deformation is not neglible).",
						"type": [
							"number",
							"null",
							"string"
						],
						"pattern": "^([0-9]*\\.?[0-9]*)$",
						"examples": [
							500,
							null
						]
					},
					"shear_area_y": {
						"$id": "#/properties/sections/properties/instance/properties/type1/shear_area_y",
						"title": "The shear_area_y Schema",
						"description": "Optional. Do not get confused between this property and the one with the same name within the 'aux' property. Shear Area in the Y-axis. Leave this value as Empty or Zero for a Euler-Bernoulli Beam (Recommended). Enter a value for a Timoshenko Beam (i.e. where shear deformation is not neglible).",
						"type": [
							"number",
							"null",
							"string"
						],
						"pattern": "^([0-9]*\\.?[0-9]*)$",
						"examples": [
							800,
							null
						]
					},
					"revit": {
						"type": [
							"string",
							"null"
						]
					},
					"aux": {
						"$id": "#/properties/sections/properties/instance/type1/properties/aux",
						"title": "The aux Schema",
						"description": "The 'aux' property is an object containing various property values. It contains the geometric coordinates of the cross section among other properties which are calculated via the 'Section Builder' software. For brevity, the individual properties are not detailed here. To understand how to create a section via the 'Section Builder' and implement it into the API, please contact us at info@skyciv.com",
						"type": "object",
						"required": [
							"composite",
							"Qz",
							"Qy",
							"centroid_point",
							"centroid_length",
							"depth",
							"width",
							"alpha",
							"shear_area_z",
							"shear_area_y",
							"torsion_radius"
						],
						"properties": {
							"composite": {
								"$id": "#/properties/sections/properties/instance/type1/properties/aux/properties/composite",
								"title": "The composite Schema",
								"type": "boolean",
								"default": false
							},
							"Qz": {
								"$id": "#/properties/sections/properties/instance/type1/properties/aux/properties/Qz",
								"title": "The Qz Schema",
								"default": 0,
								"type": "number"
							},
							"Qy": {
								"$id": "#/properties/sections/properties/instance/type1/properties/aux/properties/Qy",
								"title": "The Qy Schema",
								"default": 0,
								"type": "number"
							},
							"centroid_point": {
								"$id": "#/properties/sections/properties/instance/type1/properties/aux/properties/centroid_point",
								"title": "The centroid_point Schema",
								"type": "array",
								"minItems": 2,
								"maxItems": 2,
								"items": {
									"$id": "#/properties/sections/properties/instance/type1/properties/aux/properties/centroid_point/items",
									"type": "number",
									"title": "The Items Schema",
									"default": 0,
									"examples": [
										101.6,
										101.6
									]
								}
							},
							"centroid_length": {
								"$id": "#/properties/sections/properties/instance/type1/properties/aux/properties/centroid_length",
								"title": "The centroid_length Schema",
								"type": "array",
								"minItems": 2,
								"maxItems": 2,
								"items": {
									"$id": "#/properties/sections/properties/instance/type1/properties/aux/properties/centroid_length/items",
									"type": "number",
									"title": "The Items Schema",
									"default": 0,
									"examples": [
										101.6,
										101.6
									]
								}
							},
							"depth": {
								"$id": "#/properties/sections/properties/instance/type1/properties/aux/properties/depth",
								"title": "The depth Schema",
								"default": 0,
								"type": "number"
							},
							"width": {
								"$id": "#/properties/sections/properties/instance/type1/properties/aux/properties/width",
								"title": "The width Schema",
								"default": 0,
								"type": "number"
							},
							"alpha": {
								"$id": "#/properties/sections/properties/instance/type1/properties/aux/properties/alpha",
								"title": "The alpha Schema",
								"default": 0,
								"type": "number"
							},
							"Zy": {
								"$id": "#/properties/sections/properties/instance/type1/properties/aux/properties/Zy",
								"title": "The Zy Schema",
								"type": "number"
							},
							"Zz": {
								"$id": "#/properties/sections/properties/instance/type1/properties/aux/properties/Zz",
								"title": "The Zz Schema",
								"type": "number"
							},
							"warping_constant": {
								"$id": "#/properties/sections/properties/instance/type1/properties/aux/properties/warping_constant",
								"title": "The warping_constant Schema",
								"type": "number"
							},
							"shear_area_z": {
								"$id": "#/properties/sections/properties/instance/type1/properties/aux/properties/shear_area_z",
								"title": "The shear_area_z Schema",
								"default": 0,
								"type": "number"
							},
							"shear_area_y": {
								"$id": "#/properties/sections/properties/instance/type1/properties/aux/properties/shear_area_y",
								"title": "The shear_area_y Schema",
								"default": 0,
								"type": "number"
							},
							"torsion_radius": {
								"$id": "#/properties/sections/properties/instance/type1/properties/aux/properties/torsion_radius",
								"title": "The torsion_radius Schema",
								"default": 0,
								"type": "number"
							}
						}
					},
					"user_data": {}
				}
			}

			var load_section_schema = {
				"$id": "#/properties/sections/properties/instance/type2",
				"type": "object",
				"title": "The Sections Array Schema",
				"description": "One can call a definition from the Section Database, instead of defining a Section explicitly",
				"required": [
					"load_section",
					"material_id"
				],
				"properties": {
					"load_section": {
						"$id": "#/properties/sections/properties/instance/type2/load_section",
						"type": [
							"array",
							"string"
						],
						"title": "The Load Section Schema",
						"$comment": "Array is a list of strings eg. ['American', 'AISC', 'W shapes', 'W14x808']",
						"items": {
							"type": "string"
						},
						"minItems": 4,
						"maxItems": 4,
					},
					"material_id": {
						"$id": "#/properties/sections/properties/instance/type2/material_id",
						"title": "The Material ID Schema",
						"description": "The material attached to this particle section.",
						"type": "integer",
						"minimum": 1
					},
					"user_data": {}
				}
			}

			var load_custom_schema = {
				"$id": "#/properties/sections/properties/instance/type3",
				"type": "object",
				"title": "The Sections Array Schema",
				"description": "One can call a definition from the Section Database, instead of defining a Section explicitly",
				"required": [
					"load_custom",
					"material_id"
				],
				"properties": {
					"load_section": {
						"$id": "#/properties/sections/properties/instance/type2/load_custom",
						"type": [
							"string"
						],
						"title": "The Load Section Schema",
						"$comment": "The name of your custom section, as saved in the Section Builder",
						"items": {
							"type": "string"
						}
					},
					"material_id": {
						"$id": "#/properties/sections/properties/instance/type2/material_id",
						"title": "The Material ID Schema",
						"description": "The material attached to this particle section.",
						"type": "integer",
						"minimum": 1
					},
					"user_data": {}
				}
			}

			var sections = model_data.sections;
			var validate_a = ajv.compile(info_schema);
			var validate_b = ajv.compile(section_builder_schema);
			var validate_c = ajv.compile(load_section_schema);
			var validate_d = ajv.compile(load_custom_schema);
			var errors = [];

			for (const s in sections) {
				var a_is_valid = validate_a(sections[s]);
				var b_is_valid = validate_b(sections[s]);
				var c_is_valid = validate_c(sections[s]);
				var d_is_valid = validate_d(sections[s]);

				if (!a_is_valid && !b_is_valid && !c_is_valid && !d_is_valid) {
					errors.push("sections[" + s + "] does not match an accepted specification. Please follow one specification for this section. Refer to https://skyciv.com/api/v3/docs/s3d-model/#sections");

					errors.push("If using the \"info\" format:");
					for (var e = 0; e < validate_a.errors.length; e++) {
						if (validate_a.errors[e].dataPath !== "") {
							validate_a.errors[e].dataPath = "sections[" + s + "]" + validate_a.errors[e].dataPath;
						} else {
							validate_a.errors[e].dataPath = "sections[" + s + "]";
						}
						errors.push(validate_a.errors[e]);
					}

					errors.push("If using the \"section builder\" format:");
					for (var e = 0; e < validate_b.errors.length; e++) {
						if (validate_b.errors[e].dataPath !== "") {
							validate_b.errors[e].dataPath = "sections[" + s + "]" + validate_b.errors[e].dataPath;
						} else {
							validate_b.errors[e].dataPath = "sections[" + s + "]";
						}
						errors.push(validate_b.errors[e]);
					}

					errors.push("If using the \"load_section\" format:");
					for (var e = 0; e < validate_c.errors.length; e++) {
						if (validate_c.errors[e].dataPath !== "") {
							validate_c.errors[e].dataPath = "sections[" + s + "]" + validate_c.errors[e].dataPath;
						} else {
							validate_c.errors[e].dataPath = "sections[" + s + "]";
						}
						errors.push(validate_c.errors[e]);
					}

					errors.push("If using the \"load_custom\" format:");
					for (var e = 0; e < validate_d.errors.length; e++) {
						if (validate_d.errors[e].dataPath !== "") {
							validate_d.errors[e].dataPath = "sections[" + s + "]" + validate_d.errors[e].dataPath;
						} else {
							validate_d.errors[e].dataPath = "sections[" + s + "]";
						}
						errors.push(validate_d.errors[e]);
					}
				}
			}

			if (errors.length > 0) {
				return errors;
			} else {
				return true;
			}
		},
		"unitsAreMixedOrMalformed": function (model_data) {
			var units = {
				"length": {
					"metric": ["m", "mm"],
					"imperial": ["ft", "in"],
				},
				"section_length": {
					"metric": ["mm"],
					"imperial": ["in"],
				},
				"material_strength": {
					"metric": ["mpa"],
					"imperial": ["ksi", "psi"],
				},
				"temperature": {
					"metric": ["degc"],
					"imperial": ["degf"]
				},
				"density": {
					"metric": ["kg/m3"],
					"imperial": ["lb/ft3"],
				},
				"force": {
					"metric": ["kn", "n", "kg"],
					"imperial": ["kip", "lb"],
				},
				"moment": {
					"metric": ["kn-m", "n-m", "kg-m"],
					"imperial": ["kip-ft", "lb-ft", "lb-in"],
				},
				"pressure": {
					"metric": ["mpa", "kpa", "pa"],
					"imperial": ["ksf", "ksi", "psf", "psi"],
				},
				"mass": {
					"metric": ["kg"],
					"imperial": ["kip", "lb"],
				},
				"translation": {
					"metric": ["m", "mm"],
					"imperial": ["in"],
				},
				"stress": {
					"metric": ["mpa", "kpa"],
					"imperial": ["ksi", "psi"]
				}
			}

			var metric_count = 0;
			var imperial_count = 0;
			var outlier_count = 0;
			var keys = [];
			var malformed_keys = [];

			if (typeof model_data["settings"]["units"] === "object") {
				for (const k in model_data["settings"]["units"]) {

					if (!units[k]) {
						return [
							k + " is not a unit key."
						];
					}
					if (units[k]["metric"].indexOf(model_data["settings"]["units"][k]) > -1) {
						metric_count++;
						keys.push("Metric " + k + " detected.");

					} else if (units[k]["imperial"].indexOf(model_data["settings"]["units"][k]) > -1) {
						imperial_count++;
						keys.push("Imperial " + k + " detected.");

					} else {
						var metric_formatted = [];
						var imperial_formatted = [];

						for (const u in units[k]["metric"]) {
							metric_formatted.push("\"" + units[k]["metric"][u] + "\"")
						}

						for (const u in units[k]["imperial"]) {
							imperial_formatted.push("\"" + units[k]["imperial"][u] + "\"")
						}

						keys.push("settings." + k + " if metric should be: " + metric_formatted.join(" or ") + ". Or if imperial should be: " + imperial_formatted.join(" or "))
						malformed_keys.push("settings." + k + " (" + model_data["settings"]["units"][k] + ") does not fit either Metric or Imperial specification.")
						outlier_count++;
					}
				}

				if (metric_count > 0 && imperial_count > 0 && outlier_count > 0) {
					return [
						[
							"1. Please specify units as metric-only or imperial-only.",
							"2. Units were detected that do not fit any specification. To remedy both errors refer to https://skyciv.com/api/v3/docs/s3d-model/#units"
						],
						keys
					];
				} else if (metric_count > 0 && imperial_count > 0 && outlier_count == 0) {
					return [
						[
							"Please specify units as metric-only or imperial-only. Refer to https://skyciv.com/api/v3/docs/s3d-model/#units",
						],
						keys
					];
				} else if (outlier_count > 0) {
					return malformed_keys;
				} else {
					return false;
				}
			}
		},
		"isV2Format": function (model_data) {
			var has_auth = model_data.hasOwnProperty("auth");
			var has_file_management = model_data.hasOwnProperty("file_management");
			var has_analysis_report = model_data.hasOwnProperty("analysis_report");

			if (has_auth && has_file_management && has_analysis_report) {
				return true;
			}
		},
		"selfWeight": function (model_data) {
			if (model_data.hasOwnProperty("self_weight")) {
				if (this.hasSelfWeightInstances(model_data.self_weight)) {
					let self_weight = model_data.self_weight;
					let instances = this.getInstances(model_data.self_weight);
					let errors = [];

					for (const instance in instances) {
						let pointer = instances[instance].toString();
						let has_LG = self_weight[pointer].hasOwnProperty("LG");
						let has_load_group = self_weight[pointer].hasOwnProperty("load_group");

						if (has_LG && has_load_group) {
							errors.push({
								keyword: 'oneOf',
								dataPath: '/selfWeight[' + pointer + ']',
								message: "Has both 'LG' and 'load_group'. Please use one exclusively."
							})
						}
					}

					if (errors.length > 0) {
						return errors;
					} else {
						return true;
					}
				} else {
					let self_weight = model_data.self_weight;
					let has_LG = self_weight.hasOwnProperty("LG");
					let has_load_group = self_weight.hasOwnProperty("load_group");

					if (has_LG && has_load_group) {
						return [{
							keyword: 'oneOf',
							dataPath: '/selfWeight',
							message: "Has both 'LG' and 'load_group'. Please use one exclusively."
						}]
					} else {
						return true;
					}
				}
			}
		},
		"hasSelfWeightInstances": function (model_data) {
			const property_names = Object.keys(model_data);

			for (const property_name of property_names) {
				const number_value = parseInt(property_name);

				if (!isNaN(number_value)) {
					return true;
				}
			}

			return false;
		},
		"getInstances": function (self_weight) {
			const property_names = Object.keys(self_weight);
			let instances = [];

			for (const property_name of property_names) {
				const number_value = parseInt(property_name);

				if (!isNaN(number_value)) {
					instances.push(number_value);
				}
			}

			return instances;
		}
	}

	function validateModel(model_data, log_flag) {
		var validate = ajv.compile(model_schema);
		var is_valid = validate(model_data);
		var model_data_str = model_data;

		if (typeof model_data_str !== "string") {
			model_data_str = JSON.stringify(model_data, null, '\t');
		}

		// ++++++++++++ Logging is overkill?
		if (is_valid) {
			if (log_flag == true) console.log("Model format OK");
			return errorResponse([]);
		} else {
			if (log_flag == true) console.log(errorResponse(validate.errors));
			return errorResponse(validate.errors);		// Loop over .messages in caller for user messages.
		}
	}

	function errorResponse(errors) {
		var is_valid = false;
		if (errors.length == 0) {
			return {
				status: true,
				errors: [],
				messages: []
			}
		}

		var messages = [];
		if (errors && typeof errors == "object") {
			for (var i = 0; i < errors.length; i++) {
				var error_msg = error2message(errors[i]);
				messages.push(error_msg);
			}
		}

		return {
			status: is_valid,
			errors: errors,
			messages: messages
		}
	}

	function error2message(obj) {
		switch (obj.keyword) {
			case "type":
			case "required":
			case "maximum":
			case "minimum":
			case "exclusiveMinimum":
			case "exclusiveMaximum":
			case "errorMessage":		// Custom error messages using ajv-errors plugin.
			case "pattern":
				return obj.dataPath + " " + obj.message.toString();
			case "enum":
				return obj.dataPath + " should be one of the following inputs: " + obj.params.allowedValues.toString().replace(/,/g, ", ");
			default:
				return obj.dataPath + " " + obj.message + ": " + JSON.stringify(obj.params);
		}
	}

	function isV2Format(model_data) {
		var has_auth = model_data.hasOwnProperty("auth");
		var has_file_management = model_data.hasOwnProperty("file_management");
		var has_analysis_report = model_data.hasOwnProperty("analysis_report");

		if (has_auth || has_file_management || has_analysis_report) {
			return true;
		}
	}

	function unitsAreMixedOrMalformed(model_data) {
		var units = {
			"length": {
				"metric": ["m", "mm"],
				"imperial": ["ft", "in"],
			},
			"section_length": {
				"metric": ["mm"],
				"imperial": ["in"],
			},
			"material_strength": {
				"metric": ["mpa"],
				"imperial": ["ksi", "psi"],
			},
			"temperature": {
				"metric": ["degc"],
				"imperial": ["degf"]
			},
			"density": {
				"metric": ["kg/m3"],
				"imperial": ["lb/ft3"],
			},
			"force": {
				"metric": ["kn", "n", "kg"],
				"imperial": ["kip", "lb"],
			},
			"moment": {
				"metric": ["kn-m", "n-m", "kg-m"],
				"imperial": ["kip-ft", "lb-ft", "lb-in"],
			},
			"pressure": {
				"metric": ["mpa", "kpa", "pa"],
				"imperial": ["ksf", "ksi", "psf", "psi"],
			},
			"mass": {
				"metric": ["kg"],
				"imperial": ["kip", "lb"],
			},
			"translation": {
				"metric": ["m", "mm"],
				"imperial": ["in"],
			},
			"stress": {
				"metric": ["mpa", "kpa"],
				"imperial": ["ksi", "psi"]
			}
		}

		var metric_count = 0;
		var imperial_count = 0;
		var outlier_count = 0;
		var keys = [];
		var malformed_keys = [];

		if (typeof model_data.settings.units === "object") {
			for (const k in model_data.settings.units) {
				if (units[k].metric.indexOf(model_data.settings.units[k]) > -1) {
					metric_count++;
					keys.push("Metric " + k + " detected.");

				} else if (units[k].imperial.indexOf(model_data.settings.units[k]) > -1) {
					imperial_count++;
					keys.push("Imperial " + k + " detected.");

				} else {
					var metric_formatted = [];
					var imperial_formatted = [];

					for (const u in units[k].metric) {
						metric_formatted.push("\"" + units[k].metric[u] + "\"")
					}

					for (const u in units[k].imperial) {
						imperial_formatted.push("\"" + units[k].imperial[u] + "\"")
					}

					keys.push("settings." + k + " if metric should be: " + metric_formatted.join(" or ") + ". Or if imperial should be: " + imperial_formatted.join(" or "))
					malformed_keys.push("settings." + k + " does not fit either Metric or Imperial specification.")
					outlier_count++;
				}
			}

			if (metric_count > 0 && imperial_count > 0 && outlier_count > 0) {
				return [
					[
						"1. Please specify units as metric-only or imperial-only.",
						"2. Units were detected that do not fit any specification. To remedy both errors refer to https://skyciv.com/api/v3/docs/s3d-model/#units"
					],
					keys
				];
			} else if (metric_count > 0 && imperial_count > 0 && outlier_count == 0) {
				return [
					[
						"Please specify units as metric-only or imperial-only. Refer to https://skyciv.com/api/v3/docs/s3d-model/#units",
					],
					keys
				];
			} else if (outlier_count > 0) {
				return [
					[
						"Units were detected that do not fit any specification. Refer to https://skyciv.com/api/v3/docs/s3d-model/#units"
					],
					malformed_keys]
			} else {
				return false;
			}
		}
	}

	function validateStart(input) {
		try {
			for (var i = 0; i < input.functions.length; i++) {
				if (!input.functions[i]) continue;
				if (!input.functions[i].arguments) continue;
				if (!input.functions[i].arguments.s3d_model) continue;

				var model_data = input.functions[i].arguments.s3d_model;

				if (typeof model_data === "string") {
					model_data = JSON.parse(model_data);
				}

				if (isV2Format(model_data)) {
					return {
						"status": false,
						"messages": ["Model appears to be v2 format. Please use a v3 model: https://skyciv.com/api/v3/docs/s3d-model/"]
					};
				}

				var units_mixed_or_malformed = unitsAreMixedOrMalformed(model_data);

				if (units_mixed_or_malformed) {
					return {
						"status": false,
						"messages": units_mixed_or_malformed
					}
				}

				var has_members = model_data.hasOwnProperty("members");
				var has_plates = model_data.hasOwnProperty("plates");

				if (!has_members && !has_plates) {
					return {
						"status": false,
						"messages": ["Model is missing both members and plates."]
					};
				}

				var sections_result = structuralChecks.sections(model_data);

				if (sections_result !== true) {
					// console.log(sections_result);
					var error_obj = errorResponse(sections_result);
					// console.log(error_obj);

					for (var e = 0; e < error_obj.errors.length; e++) {
						if (typeof error_obj.errors[e] === "string") {
							error_obj.errors.splice(e, 1);
							e--;
						}
					}

					// console.log(error_obj);
					return error_obj;
				}

				var selfweight_result = structuralChecks.selfWeight(model_data);

				if (selfweight_result !== true) {
					console.log(selfweight_result);
					var error_obj = errorResponse(selfweight_result);
					// console.log(error_obj);

					for (var e = 0; e < error_obj.errors.length; e++) {
						if (typeof error_obj.errors[e] === "string") {
							error_obj.errors.splice(e, 1);
							e--;
						}
					}

					// console.log(error_obj);
					return error_obj;
				}

				var result = validateModel(model_data); // Array of errors.
				var other_checks = checkElementsExists(model_data);
				if (other_checks.length > 0) {
					result.status = false;
					result.messages = result.messages.concat(other_checks);
					result.errors = result.errors.concat(other_checks);
				}

				console.log(result);
				if (typeof result !== "undefined") {
					return result;
				}

				break; // assume there will only be one s3d_model in their API object
			}

		} catch (e) {
			console.log(e)
		}
	}

	return functions;
}();

// simulate test after 2 seconds
// setTimeout(function () {
// 	skyciv.validator.model({
// 		"dataVersion": 27, "settings": { "units": { "length": "m", "section_length": "mm", "material_strength": "mpa", "density": "kg/m3", "force": "kn", "moment": "kn-m", "pressure": "kpa", "mass": "kg", "translation": "mm", "stress": "mpa" }, "precision": "fixed", "precision_values": 3, "evaluation_points": 9, "vertical_axis": "Z", "member_offsets_axis": "local", "projection_system": "orthographic", "solver_timeout": 600, "accurate_buckling_shape": false, "buckling_johnson": false, "non_linear_tolerance": "1", "non_linear_theory": "small", "auto_stabilize_model": false, "only_solve_user_defined_load_combinations": false }, "details": [], "nodes": { "1": { "x": 0, "y": 0, "z": 0 }, "2": { "x": 0, "y": 0, "z": 3.2 }, "3": { "x": 0, "y": 8, "z": 0 }, "4": { "x": 0, "y": 8, "z": 3.2 }, "5": { "x": -4, "y": 8, "z": 3.2 }, "6": { "x": -4, "y": 8, "z": 0 }, "7": { "x": -4, "y": 0, "z": 3.2 }, "8": { "x": -4, "y": 0, "z": 0 }, "9": { "x": -8, "y": 0, "z": 3.2 }, "10": { "x": -8, "y": 0, "z": 0 }, "11": { "x": -12, "y": 0, "z": 3.2 }, "12": { "x": -12, "y": 0, "z": 0 }, "13": { "x": -16, "y": 0, "z": 3.2 }, "14": { "x": -16, "y": 0, "z": 0 }, "15": { "x": -8, "y": 8, "z": 3.2 }, "16": { "x": -8, "y": 8, "z": 0 }, "17": { "x": -12, "y": 8, "z": 3.2 }, "18": { "x": -12, "y": 8, "z": 0 }, "19": { "x": -16, "y": 8, "z": 3.2 }, "20": { "x": -16, "y": 8, "z": 0 }, "21": { "x": 0, "y": 4, "z": 4.05 }, "22": { "x": -4, "y": 4, "z": 4.05 }, "23": { "x": -8, "y": 4, "z": 4.05 }, "24": { "x": -12, "y": 4, "z": 4.05 }, "25": { "x": -16, "y": 4, "z": 4.05 }, "26": { "x": 0, "y": 4, "z": 0 }, "27": { "x": -16, "y": 4, "z": 0 }, "28": { "x": 0, "y": 8, "z": 0.3 }, "29": { "x": 0, "y": 0, "z": 0.3 }, "30": { "x": -4, "y": 8, "z": 0.3 }, "31": { "x": -8, "y": 8, "z": 0.3 }, "32": { "x": -12, "y": 8, "z": 0.3 }, "33": { "x": -16, "y": 8, "z": 0.3 }, "34": { "x": 0, "y": 4, "z": 0.3 }, "35": { "x": -16, "y": 0, "z": 0.3 }, "36": { "x": -16, "y": 4, "z": 0.3 }, "37": { "x": -12, "y": 0, "z": 0.3 }, "38": { "x": -8, "y": 0, "z": 0.3 }, "39": { "x": -4, "y": 0, "z": 0.3 }, "40": { "x": 0, "y": 8, "z": 1.8 }, "41": { "x": 0, "y": 0, "z": 1.8 }, "42": { "x": -16, "y": 0, "z": 1.8 }, "43": { "x": -16, "y": 8, "z": 1.8 }, "44": { "x": -16, "y": 4, "z": 1.8 }, "45": { "x": -12, "y": 0, "z": 1.8 }, "46": { "x": -8, "y": 0, "z": 1.8 }, "47": { "x": -4, "y": 0, "z": 1.8 }, "48": { "x": 0, "y": 4, "z": 1.8 }, "49": { "x": -4, "y": 8, "z": 1.8 }, "50": { "x": -8, "y": 8, "z": 1.8 }, "51": { "x": -12, "y": 8, "z": 1.8 }, "52": { "x": -16, "y": 4.106495217402749, "z": 4.0273697663019155 }, "53": { "x": -16, "y": 3.8907808395424657, "z": 4.026790928402773 }, "54": { "x": -16, "y": 5.1730913327250905, "z": 3.8007180917959182 }, "55": { "x": -16, "y": 6.347018410843388, "z": 3.55125858769578 }, "56": { "x": -16, "y": 7.518297139482533, "z": 3.302361857859962 }, "57": { "x": -16, "y": 2.836786562819652, "z": 3.802817144599176 }, "58": { "x": -16, "y": 1.650394228127027, "z": 3.5507087734769933 }, "59": { "x": -16, "y": 0.47340621411934947, "z": 3.300598820500362 }, "60": { "x": -12, "y": 0.47340621411934947, "z": 3.300598820500362 }, "61": { "x": -8, "y": 0.47340621411934947, "z": 3.300598820500362 }, "62": { "x": -4, "y": 0.47340621411934947, "z": 3.300598820500362 }, "63": { "x": 0, "y": 0.47340621411934947, "z": 3.300598820500362 }, "64": { "x": -12, "y": 1.650394228127027, "z": 3.5507087734769933 }, "65": { "x": -8, "y": 1.650394228127027, "z": 3.5507087734769933 }, "66": { "x": -4, "y": 1.650394228127027, "z": 3.5507087734769933 }, "67": { "x": 0, "y": 1.650394228127027, "z": 3.5507087734769933 }, "68": { "x": -12, "y": 2.836786562819652, "z": 3.802817144599176 }, "69": { "x": -8, "y": 2.836786562819652, "z": 3.802817144599176 }, "70": { "x": -4, "y": 2.836786562819652, "z": 3.802817144599176 }, "71": { "x": 0, "y": 2.836786562819652, "z": 3.802817144599176 }, "72": { "x": -12, "y": 3.8907808395424657, "z": 4.026790928402773 }, "73": { "x": -8, "y": 3.8907808395424657, "z": 4.026790928402773 }, "74": { "x": -4, "y": 3.8907808395424657, "z": 4.026790928402773 }, "75": { "x": 0, "y": 3.8907808395424657, "z": 4.026790928402773 }, "76": { "x": -12, "y": 4.106495217402749, "z": 4.0273697663019155 }, "77": { "x": -8, "y": 4.106495217402749, "z": 4.0273697663019155 }, "78": { "x": -4, "y": 4.106495217402749, "z": 4.0273697663019155 }, "79": { "x": 0, "y": 4.106495217402749, "z": 4.0273697663019155 }, "80": { "x": -12, "y": 5.1730913327250905, "z": 3.8007180917959182 }, "81": { "x": -8, "y": 5.1730913327250905, "z": 3.8007180917959182 }, "82": { "x": -4, "y": 5.1730913327250905, "z": 3.8007180917959182 }, "83": { "x": 0, "y": 5.1730913327250905, "z": 3.8007180917959182 }, "84": { "x": -12, "y": 6.347018410843388, "z": 3.55125858769578 }, "85": { "x": -8, "y": 6.347018410843388, "z": 3.55125858769578 }, "86": { "x": -4, "y": 6.347018410843388, "z": 3.55125858769578 }, "87": { "x": 0, "y": 6.347018410843388, "z": 3.55125858769578 }, "88": { "x": -12, "y": 7.518297139482533, "z": 3.302361857859962 }, "89": { "x": -8, "y": 7.518297139482533, "z": 3.302361857859962 }, "90": { "x": -4, "y": 7.518297139482533, "z": 3.302361857859962 }, "91": { "x": 0, "y": 7.518297139482533, "z": 3.302361857859962 }, "92": { "x": -16, "y": 4, "z": 3.2 }, "93": { "x": 0, "y": 4, "z": 3.2 } }, "members": { "1": { "type": "normal_continuous", "cable_length": null, "node_A": 1, "node_B": 2, "section_id": 3, "rotation_angle": 0, "fixity_A": "FFFFFF", "fixity_B": "FFFFFF", "offset_Ax": "0", "offset_Ay": "0", "offset_Az": "0", "offset_Bx": "0", "offset_By": "0", "offset_Bz": "0" }, "2": { "type": "normal_continuous", "cable_length": null, "node_A": 3, "node_B": 5, "section_id": 6, "rotation_angle": 90, "fixity_A": "FFFFRR", "fixity_B": "FFFFRR", "offset_Ax": "0", "offset_Ay": "0", "offset_Az": "0", "offset_Bx": "0", "offset_By": "0", "offset_Bz": "0" }, "3": { "type": "normal_continuous", "cable_length": null, "node_A": 4, "node_B": 6, "section_id": 6, "rotation_angle": 90, "fixity_A": "FFFFRR", "fixity_B": "FFFFRR", "offset_Ax": "0", "offset_Ay": "0", "offset_Az": "0", "offset_Bx": "0", "offset_By": "0", "offset_Bz": "0" }, "4": { "type": "normal_continuous", "cable_length": null, "node_A": 5, "node_B": 6, "section_id": 3, "rotation_angle": 0, "fixity_A": "FFFFFF", "fixity_B": "FFFFFF", "offset_Ax": "0", "offset_Ay": "0", "offset_Az": "0", "offset_Bx": "0", "offset_By": "0", "offset_Bz": "0" }, "5": { "type": "normal_continuous", "cable_length": null, "node_A": 4, "node_B": 22, "section_id": 6, "rotation_angle": 0, "fixity_A": "FFFFRR", "fixity_B": "FFFFRR", "offset_Ax": "0", "offset_Ay": "0", "offset_Az": "0", "offset_Bx": "0", "offset_By": "0", "offset_Bz": "0" }, "6": { "type": "normal_continuous", "cable_length": null, "node_A": 7, "node_B": 8, "section_id": 3, "rotation_angle": 0, "fixity_A": "FFFFFF", "fixity_B": "FFFFFF", "offset_Ax": "0", "offset_Ay": "0", "offset_Az": "0", "offset_Bx": "0", "offset_By": "0", "offset_Bz": "0" }, "7": { "type": "normal_continuous", "cable_length": null, "node_A": 21, "node_B": 5, "section_id": 6, "rotation_angle": 0, "fixity_A": "FFFFRR", "fixity_B": "FFFFRR", "offset_Ax": "0", "offset_Ay": "0", "offset_Az": "0", "offset_Bx": "0", "offset_By": "0", "offset_Bz": "0" }, "8": { "type": "normal_continuous", "cable_length": null, "node_A": 9, "node_B": 10, "section_id": 3, "rotation_angle": 0, "fixity_A": "FFFFFF", "fixity_B": "FFFFFF", "offset_Ax": "0", "offset_Ay": "0", "offset_Az": "0", "offset_Bx": "0", "offset_By": "0", "offset_Bz": "0" }, "9": { "type": "normal_continuous", "cable_length": null, "node_A": 22, "node_B": 2, "section_id": 6, "rotation_angle": 0, "fixity_A": "FFFFRR", "fixity_B": "FFFFRR", "offset_Ax": "0", "offset_Ay": "0", "offset_Az": "0", "offset_Bx": "0", "offset_By": "0", "offset_Bz": "0" }, "10": { "type": "normal_continuous", "cable_length": null, "node_A": 11, "node_B": 12, "section_id": 3, "rotation_angle": 0, "fixity_A": "FFFFFF", "fixity_B": "FFFFFF", "offset_Ax": "0", "offset_Ay": "0", "offset_Az": "0", "offset_Bx": "0", "offset_By": "0", "offset_Bz": "0" }, "11": { "type": "normal_continuous", "cable_length": null, "node_A": 21, "node_B": 7, "section_id": 6, "rotation_angle": 0, "fixity_A": "FFFFRR", "fixity_B": "FFFFRR", "offset_Ax": "0", "offset_Ay": "0", "offset_Az": "0", "offset_Bx": "0", "offset_By": "0", "offset_Bz": "0" }, "12": { "type": "normal_continuous", "cable_length": null, "node_A": 7, "node_B": 1, "section_id": 6, "rotation_angle": 90, "fixity_A": "FFFFRR", "fixity_B": "FFFFRR", "offset_Ax": "0", "offset_Ay": "0", "offset_Az": "0", "offset_Bx": "0", "offset_By": "0", "offset_Bz": "0" }, "13": { "type": "normal_continuous", "cable_length": null, "node_A": 2, "node_B": 7, "section_id": 1, "rotation_angle": -90, "fixity_A": "FFFFFF", "fixity_B": "FFFFFF", "offset_Ax": "0", "offset_Ay": "0", "offset_Az": "0", "offset_Bx": "0", "offset_By": "0", "offset_Bz": "0" }, "14": { "type": "normal_continuous", "cable_length": null, "node_A": 15, "node_B": 16, "section_id": 3, "rotation_angle": 0, "fixity_A": "FFFFFF", "fixity_B": "FFFFFF", "offset_Ax": "0", "offset_Ay": "0", "offset_Az": "0", "offset_Bx": "0", "offset_By": "0", "offset_Bz": "0" }, "15": { "type": "normal_continuous", "cable_length": null, "node_A": 8, "node_B": 2, "section_id": 6, "rotation_angle": 90, "fixity_A": "FFFFRR", "fixity_B": "FFFFRR", "offset_Ax": "0", "offset_Ay": "0", "offset_Az": "0", "offset_Bx": "0", "offset_By": "0", "offset_Bz": "0" }, "16": { "type": "normal_continuous", "cable_length": null, "node_A": 17, "node_B": 18, "section_id": 3, "rotation_angle": 0, "fixity_A": "FFFFFF", "fixity_B": "FFFFFF", "offset_Ax": "0", "offset_Ay": "0", "offset_Az": "0", "offset_Bx": "0", "offset_By": "0", "offset_Bz": "0" }, "17": { "type": "normal_continuous", "cable_length": null, "node_A": 4, "node_B": 5, "section_id": 1, "rotation_angle": 90, "fixity_A": "FFFFFF", "fixity_B": "FFFFFF", "offset_Ax": "0", "offset_Ay": "0", "offset_Az": "0", "offset_Bx": "0", "offset_By": "0", "offset_Bz": "0" }, "18": { "type": "normal_continuous", "cable_length": null, "node_A": 14, "node_B": 11, "section_id": 6, "rotation_angle": 90, "fixity_A": "FFFFRR", "fixity_B": "FFFFRR", "offset_Ax": "0", "offset_Ay": "0", "offset_Az": "0", "offset_Bx": "0", "offset_By": "0", "offset_Bz": "0" }, "19": { "type": "normal_continuous", "cable_length": null, "node_A": 7, "node_B": 9, "section_id": 1, "rotation_angle": -90, "fixity_A": "FFFFFF", "fixity_B": "FFFFFF", "offset_Ax": "0", "offset_Ay": "0", "offset_Az": "0", "offset_Bx": "0", "offset_By": "0", "offset_Bz": "0" }, "20": { "type": "normal_continuous", "cable_length": null, "node_A": 9, "node_B": 11, "section_id": 1, "rotation_angle": -90, "fixity_A": "FFFFFF", "fixity_B": "FFFFFF", "offset_Ax": "0", "offset_Ay": "0", "offset_Az": "0", "offset_Bx": "0", "offset_By": "0", "offset_Bz": "0" }, "21": { "type": "normal_continuous", "cable_length": null, "node_A": 11, "node_B": 13, "section_id": 1, "rotation_angle": -90, "fixity_A": "FFFFFF", "fixity_B": "FFFFFF", "offset_Ax": "0", "offset_Ay": "0", "offset_Az": "0", "offset_Bx": "0", "offset_By": "0", "offset_Bz": "0" }, "22": { "type": "normal_continuous", "cable_length": null, "node_A": 5, "node_B": 15, "section_id": 1, "rotation_angle": 90, "fixity_A": "FFFFFF", "fixity_B": "FFFFFF", "offset_Ax": "0", "offset_Ay": "0", "offset_Az": "0", "offset_Bx": "0", "offset_By": "0", "offset_Bz": "0" }, "23": { "type": "normal_continuous", "cable_length": null, "node_A": 2, "node_B": 21, "section_id": 3, "rotation_angle": 0, "fixity_A": "FFFFFF", "fixity_B": "FFFFFF", "offset_Ax": "0", "offset_Ay": "0", "offset_Az": "0", "offset_Bx": "0", "offset_By": "0", "offset_Bz": "0" }, "24": { "type": "normal_continuous", "cable_length": null, "node_A": 12, "node_B": 13, "section_id": 6, "rotation_angle": 90, "fixity_A": "FFFFRR", "fixity_B": "FFFFRR", "offset_Ax": "0", "offset_Ay": "0", "offset_Az": "0", "offset_Bx": "0", "offset_By": "0", "offset_Bz": "0" }, "25": { "type": "normal_continuous", "cable_length": null, "node_A": 7, "node_B": 22, "section_id": 3, "rotation_angle": 180, "fixity_A": "FFFFFF", "fixity_B": "FFFFFF", "offset_Ax": "0", "offset_Ay": "0", "offset_Az": "0", "offset_Bx": "0", "offset_By": "0", "offset_Bz": "0" }, "26": { "type": "normal_continuous", "cable_length": null, "node_A": 22, "node_B": 5, "section_id": 3, "rotation_angle": 0, "fixity_A": "FFFFFF", "fixity_B": "FFFFFF", "offset_Ax": "0", "offset_Ay": "0", "offset_Az": "0", "offset_Bx": "0", "offset_By": "0", "offset_Bz": "0" }, "27": { "type": "normal_continuous", "cable_length": null, "node_A": 9, "node_B": 23, "section_id": 3, "rotation_angle": 180, "fixity_A": "FFFFFF", "fixity_B": "FFFFFF", "offset_Ax": "0", "offset_Ay": "0", "offset_Az": "0", "offset_Bx": "0", "offset_By": "0", "offset_Bz": "0" }, "28": { "type": "normal_continuous", "cable_length": null, "node_A": 23, "node_B": 15, "section_id": 3, "rotation_angle": 0, "fixity_A": "FFFFFF", "fixity_B": "FFFFFF", "offset_Ax": "0", "offset_Ay": "0", "offset_Az": "0", "offset_Bx": "0", "offset_By": "0", "offset_Bz": "0" }, "29": { "type": "normal_continuous", "cable_length": null, "node_A": 11, "node_B": 24, "section_id": 3, "rotation_angle": 180, "fixity_A": "FFFFFF", "fixity_B": "FFFFFF", "offset_Ax": "0", "offset_Ay": "0", "offset_Az": "0", "offset_Bx": "0", "offset_By": "0", "offset_Bz": "0" }, "30": { "type": "normal_continuous", "cable_length": null, "node_A": 24, "node_B": 17, "section_id": 3, "rotation_angle": 0, "fixity_A": "FFFFFF", "fixity_B": "FFFFFF", "offset_Ax": "0", "offset_Ay": "0", "offset_Az": "0", "offset_Bx": "0", "offset_By": "0", "offset_Bz": "0" }, "31": { "type": "normal_continuous", "cable_length": null, "node_A": 13, "node_B": 25, "section_id": 3, "rotation_angle": 180, "fixity_A": "FFFFFF", "fixity_B": "FFFFFF", "offset_Ax": "0", "offset_Ay": "0", "offset_Az": "0", "offset_Bx": "0", "offset_By": "0", "offset_Bz": "0" }, "32": { "type": "normal_continuous", "cable_length": null, "node_A": 13, "node_B": 24, "section_id": 6, "rotation_angle": 0, "fixity_A": "FFFFRR", "fixity_B": "FFFFRR", "offset_Ax": "0", "offset_Ay": "0", "offset_Az": "0", "offset_Bx": "0", "offset_By": "0", "offset_Bz": "0" }, "33": { "type": "normal_continuous", "cable_length": null, "node_A": 11, "node_B": 25, "section_id": 6, "rotation_angle": 0, "fixity_A": "FFFFRR", "fixity_B": "FFFFRR", "offset_Ax": "0", "offset_Ay": "0", "offset_Az": "0", "offset_Bx": "0", "offset_By": "0", "offset_Bz": "0" }, "34": { "type": "normal_continuous", "cable_length": null, "node_A": 25, "node_B": 17, "section_id": 6, "rotation_angle": 0, "fixity_A": "FFFFRR", "fixity_B": "FFFFRR", "offset_Ax": "0", "offset_Ay": "0", "offset_Az": "0", "offset_Bx": "0", "offset_By": "0", "offset_Bz": "0" }, "35": { "type": "normal_continuous", "cable_length": null, "node_A": 24, "node_B": 19, "section_id": 6, "rotation_angle": 0, "fixity_A": "FFFFRR", "fixity_B": "FFFFRR", "offset_Ax": "0", "offset_Ay": "0", "offset_Az": "0", "offset_Bx": "0", "offset_By": "0", "offset_Bz": "0" }, "36": { "type": "normal_continuous", "cable_length": null, "node_A": 17, "node_B": 20, "section_id": 6, "rotation_angle": 90, "fixity_A": "FFFFRR", "fixity_B": "FFFFRR", "offset_Ax": "0", "offset_Ay": "0", "offset_Az": "0", "offset_Bx": "0", "offset_By": "0", "offset_Bz": "0" }, "37": { "type": "normal_continuous", "cable_length": null, "node_A": 18, "node_B": 19, "section_id": 6, "rotation_angle": 90, "fixity_A": "FFFFRR", "fixity_B": "FFFFRR", "offset_Ax": "0", "offset_Ay": "0", "offset_Az": "0", "offset_Bx": "0", "offset_By": "0", "offset_Bz": "0" }, "38": { "type": "normal_continuous", "cable_length": null, "node_A": 15, "node_B": 17, "section_id": 1, "rotation_angle": 90, "fixity_A": "FFFFFF", "fixity_B": "FFFFFF", "offset_Ax": "0", "offset_Ay": "0", "offset_Az": "0", "offset_Bx": "0", "offset_By": "0", "offset_Bz": "0" }, "39": { "type": "normal_continuous", "cable_length": null, "node_A": 17, "node_B": 19, "section_id": 1, "rotation_angle": 90, "fixity_A": "FFFFFF", "fixity_B": "FFFFFF", "offset_Ax": "0", "offset_Ay": "0", "offset_Az": "0", "offset_Bx": "0", "offset_By": "0", "offset_Bz": "0" }, "40": { "type": "normal_continuous", "cable_length": null, "node_A": 28, "node_B": 30, "section_id": 4, "rotation_angle": 0, "fixity_A": "FFFFFF", "fixity_B": "FFFFFF", "offset_Ax": "0", "offset_Ay": "0", "offset_Az": "0", "offset_Bx": "0", "offset_By": "0", "offset_Bz": "0" }, "41": { "type": "normal", "cable_length": null, "node_A": 30, "node_B": 31, "section_id": 4, "rotation_angle": 0, "fixity_A": "FFFFFF", "fixity_B": "FFFFFF", "offset_Ax": "0", "offset_Ay": "0", "offset_Az": "0", "offset_Bx": "0", "offset_By": "0", "offset_Bz": "0" }, "42": { "type": "normal", "cable_length": null, "node_A": 31, "node_B": 32, "section_id": 4, "rotation_angle": 0, "fixity_A": "FFFFFF", "fixity_B": "FFFFFF", "offset_Ax": "0", "offset_Ay": "0", "offset_Az": "0", "offset_Bx": "0", "offset_By": "0", "offset_Bz": "0" }, "43": { "type": "normal", "cable_length": null, "node_A": 32, "node_B": 33, "section_id": 4, "rotation_angle": 0, "fixity_A": "FFFFFF", "fixity_B": "FFFFFF", "offset_Ax": "0", "offset_Ay": "0", "offset_Az": "0", "offset_Bx": "0", "offset_By": "0", "offset_Bz": "0" }, "44": { "type": "normal", "cable_length": null, "node_A": 28, "node_B": 34, "section_id": 4, "rotation_angle": 0, "fixity_A": "FFFFFF", "fixity_B": "FFFFFF", "offset_Ax": "0", "offset_Ay": "0", "offset_Az": "0", "offset_Bx": "0", "offset_By": "0", "offset_Bz": "0" }, "45": { "type": "normal", "cable_length": null, "node_A": 29, "node_B": 34, "section_id": 4, "rotation_angle": 180, "fixity_A": "FFFFFF", "fixity_B": "FFFFFF", "offset_Ax": "0", "offset_Ay": "0", "offset_Az": "0", "offset_Bx": "0", "offset_By": "0", "offset_Bz": "0" }, "46": { "type": "normal", "cable_length": null, "node_A": 33, "node_B": 36, "section_id": 4, "rotation_angle": 180, "fixity_A": "FFFFFF", "fixity_B": "FFFFFF", "offset_Ax": "0", "offset_Ay": "0", "offset_Az": "0", "offset_Bx": "0", "offset_By": "0", "offset_Bz": "0" }, "47": { "type": "normal", "cable_length": null, "node_A": 36, "node_B": 35, "section_id": 4, "rotation_angle": 180, "fixity_A": "FFFFFF", "fixity_B": "FFFFFF", "offset_Ax": "0", "offset_Ay": "0", "offset_Az": "0", "offset_Bx": "0", "offset_By": "0", "offset_Bz": "0" }, "48": { "type": "normal", "cable_length": null, "node_A": 35, "node_B": 37, "section_id": 4, "rotation_angle": 180, "fixity_A": "FFFFFF", "fixity_B": "FFFFFF", "offset_Ax": "0", "offset_Ay": "0", "offset_Az": "0", "offset_Bx": "0", "offset_By": "0", "offset_Bz": "0" }, "49": { "type": "normal_continuous", "cable_length": null, "node_A": 26, "node_B": 21, "section_id": 1, "rotation_angle": 90, "fixity_A": "FFFFFF", "fixity_B": "FFFFFF", "offset_Ax": "0", "offset_Ay": "0", "offset_Az": "0", "offset_Bx": "0", "offset_By": "0", "offset_Bz": "0" }, "50": { "type": "normal_continuous", "cable_length": null, "node_A": 27, "node_B": 25, "section_id": 1, "rotation_angle": 90, "fixity_A": "FFFFFF", "fixity_B": "FFFFFF", "offset_Ax": "0", "offset_Ay": "0", "offset_Az": "0", "offset_Bx": "0", "offset_By": "0", "offset_Bz": "0" }, "51": { "type": "normal", "cable_length": null, "node_A": 37, "node_B": 38, "section_id": 4, "rotation_angle": 180, "fixity_A": "FFFFFF", "fixity_B": "FFFFFF", "offset_Ax": "0", "offset_Ay": "0", "offset_Az": "0", "offset_Bx": "0", "offset_By": "0", "offset_Bz": "0" }, "52": { "type": "normal", "cable_length": null, "node_A": 38, "node_B": 39, "section_id": 4, "rotation_angle": 180, "fixity_A": "FFFFFF", "fixity_B": "FFFFFF", "offset_Ax": "0", "offset_Ay": "0", "offset_Az": "0", "offset_Bx": "0", "offset_By": "0", "offset_Bz": "0" }, "53": { "type": "normal", "cable_length": null, "node_A": 39, "node_B": 29, "section_id": 4, "rotation_angle": 180, "fixity_A": "FFFFFF", "fixity_B": "FFFFFF", "offset_Ax": "0", "offset_Ay": "0", "offset_Az": "0", "offset_Bx": "0", "offset_By": "0", "offset_Bz": "0" }, "54": { "type": "normal", "cable_length": null, "node_A": 43, "node_B": 44, "section_id": 4, "rotation_angle": 180, "fixity_A": "FFFFFF", "fixity_B": "FFFFFF", "offset_Ax": "0", "offset_Ay": "0", "offset_Az": "0", "offset_Bx": "0", "offset_By": "0", "offset_Bz": "0" }, "55": { "type": "normal", "cable_length": null, "node_A": 44, "node_B": 42, "section_id": 4, "rotation_angle": 180, "fixity_A": "FFFFFF", "fixity_B": "FFFFFF", "offset_Ax": "0", "offset_Ay": "0", "offset_Az": "0", "offset_Bx": "0", "offset_By": "0", "offset_Bz": "0" }, "56": { "type": "normal", "cable_length": null, "node_A": 42, "node_B": 45, "section_id": 4, "rotation_angle": 180, "fixity_A": "FFFFFF", "fixity_B": "FFFFFF", "offset_Ax": "0", "offset_Ay": "0", "offset_Az": "0", "offset_Bx": "0", "offset_By": "0", "offset_Bz": "0" }, "57": { "type": "normal", "cable_length": null, "node_A": 45, "node_B": 46, "section_id": 4, "rotation_angle": 180, "fixity_A": "FFFFFF", "fixity_B": "FFFFFF", "offset_Ax": "0", "offset_Ay": "0", "offset_Az": "0", "offset_Bx": "0", "offset_By": "0", "offset_Bz": "0" }, "58": { "type": "normal", "cable_length": null, "node_A": 46, "node_B": 47, "section_id": 4, "rotation_angle": 180, "fixity_A": "FFFFFF", "fixity_B": "FFFFFF", "offset_Ax": "0", "offset_Ay": "0", "offset_Az": "0", "offset_Bx": "0", "offset_By": "0", "offset_Bz": "0" }, "59": { "type": "normal", "cable_length": null, "node_A": 47, "node_B": 41, "section_id": 4, "rotation_angle": 180, "fixity_A": "FFFFFF", "fixity_B": "FFFFFF", "offset_Ax": "0", "offset_Ay": "0", "offset_Az": "0", "offset_Bx": "0", "offset_By": "0", "offset_Bz": "0" }, "60": { "type": "normal", "cable_length": null, "node_A": 41, "node_B": 48, "section_id": 4, "rotation_angle": 180, "fixity_A": "FFFFFF", "fixity_B": "FFFFFF", "offset_Ax": "0", "offset_Ay": "0", "offset_Az": "0", "offset_Bx": "0", "offset_By": "0", "offset_Bz": "0" }, "61": { "type": "normal", "cable_length": null, "node_A": 48, "node_B": 40, "section_id": 4, "rotation_angle": 180, "fixity_A": "FFFFFF", "fixity_B": "FFFFFF", "offset_Ax": "0", "offset_Ay": "0", "offset_Az": "0", "offset_Bx": "0", "offset_By": "0", "offset_Bz": "0" }, "62": { "type": "normal", "cable_length": null, "node_A": 40, "node_B": 49, "section_id": 4, "rotation_angle": 0, "fixity_A": "FFFFFF", "fixity_B": "FFFFFF", "offset_Ax": "0", "offset_Ay": "0", "offset_Az": "0", "offset_Bx": "0", "offset_By": "0", "offset_Bz": "0" }, "63": { "type": "normal", "cable_length": null, "node_A": 49, "node_B": 50, "section_id": 4, "rotation_angle": 0, "fixity_A": "FFFFFF", "fixity_B": "FFFFFF", "offset_Ax": "0", "offset_Ay": "0", "offset_Az": "0", "offset_Bx": "0", "offset_By": "0", "offset_Bz": "0" }, "64": { "type": "normal", "cable_length": null, "node_A": 50, "node_B": 51, "section_id": 4, "rotation_angle": 0, "fixity_A": "FFFFFF", "fixity_B": "FFFFFF", "offset_Ax": "0", "offset_Ay": "0", "offset_Az": "0", "offset_Bx": "0", "offset_By": "0", "offset_Bz": "0" }, "65": { "type": "normal", "cable_length": null, "node_A": 51, "node_B": 43, "section_id": 4, "rotation_angle": 0, "fixity_A": "FFFFFF", "fixity_B": "FFFFFF", "offset_Ax": "0", "offset_Ay": "0", "offset_Az": "0", "offset_Bx": "0", "offset_By": "0", "offset_Bz": "0" }, "66": { "type": "normal", "cable_length": null, "node_A": 59, "node_B": 60, "section_id": 4, "rotation_angle": 102, "fixity_A": "FFFFFF", "fixity_B": "FFFFFF", "offset_Ax": "0", "offset_Ay": "0", "offset_Az": "0", "offset_Bx": "0", "offset_By": "0", "offset_Bz": "0" }, "67": { "type": "normal_continuous", "cable_length": null, "node_A": 21, "node_B": 4, "section_id": 3, "rotation_angle": 180, "fixity_A": "FFFFFF", "fixity_B": "FFFFFF", "offset_Ax": "0", "offset_Ay": "0", "offset_Az": "0", "offset_Bx": "0", "offset_By": "0", "offset_Bz": "0" }, "68": { "type": "normal", "cable_length": null, "node_A": 60, "node_B": 61, "section_id": 4, "rotation_angle": 102, "fixity_A": "FFFFFF", "fixity_B": "FFFFFF", "offset_Ax": "0", "offset_Ay": "0", "offset_Az": "0", "offset_Bx": "0", "offset_By": "0", "offset_Bz": "0" }, "69": { "type": "normal", "cable_length": null, "node_A": 61, "node_B": 62, "section_id": 4, "rotation_angle": 102, "fixity_A": "FFFFFF", "fixity_B": "FFFFFF", "offset_Ax": "0", "offset_Ay": "0", "offset_Az": "0", "offset_Bx": "0", "offset_By": "0", "offset_Bz": "0" }, "70": { "type": "normal", "cable_length": null, "node_A": 62, "node_B": 63, "section_id": 4, "rotation_angle": 102, "fixity_A": "FFFFFF", "fixity_B": "FFFFFF", "offset_Ax": "0", "offset_Ay": "0", "offset_Az": "0", "offset_Bx": "0", "offset_By": "0", "offset_Bz": "0" }, "71": { "type": "normal_continuous", "cable_length": null, "node_A": 25, "node_B": 19, "section_id": 3, "rotation_angle": 0, "fixity_A": "FFFFFF", "fixity_B": "FFFFFF", "offset_Ax": "0", "offset_Ay": "0", "offset_Az": "0", "offset_Bx": "0", "offset_By": "0", "offset_Bz": "0" }, "72": { "type": "normal", "cable_length": null, "node_A": 58, "node_B": 64, "section_id": 4, "rotation_angle": 102, "fixity_A": "FFFFFF", "fixity_B": "FFFFFF", "offset_Ax": "0", "offset_Ay": "0", "offset_Az": "0", "offset_Bx": "0", "offset_By": "0", "offset_Bz": "0" }, "73": { "type": "normal", "cable_length": null, "node_A": 64, "node_B": 65, "section_id": 4, "rotation_angle": 102, "fixity_A": "FFFFFF", "fixity_B": "FFFFFF", "offset_Ax": "0", "offset_Ay": "0", "offset_Az": "0", "offset_Bx": "0", "offset_By": "0", "offset_Bz": "0" }, "74": { "type": "normal", "cable_length": null, "node_A": 65, "node_B": 66, "section_id": 4, "rotation_angle": 102, "fixity_A": "FFFFFF", "fixity_B": "FFFFFF", "offset_Ax": "0", "offset_Ay": "0", "offset_Az": "0", "offset_Bx": "0", "offset_By": "0", "offset_Bz": "0" }, "75": { "type": "normal", "cable_length": null, "node_A": 66, "node_B": 67, "section_id": 4, "rotation_angle": 102, "fixity_A": "FFFFFF", "fixity_B": "FFFFFF", "offset_Ax": "0", "offset_Ay": "0", "offset_Az": "0", "offset_Bx": "0", "offset_By": "0", "offset_Bz": "0" }, "76": { "type": "normal", "cable_length": null, "node_A": 57, "node_B": 68, "section_id": 4, "rotation_angle": 102, "fixity_A": "FFFFFF", "fixity_B": "FFFFFF", "offset_Ax": "0", "offset_Ay": "0", "offset_Az": "0", "offset_Bx": "0", "offset_By": "0", "offset_Bz": "0" }, "77": { "type": "normal", "cable_length": null, "node_A": 68, "node_B": 69, "section_id": 4, "rotation_angle": 102, "fixity_A": "FFFFFF", "fixity_B": "FFFFFF", "offset_Ax": "0", "offset_Ay": "0", "offset_Az": "0", "offset_Bx": "0", "offset_By": "0", "offset_Bz": "0" }, "78": { "type": "normal", "cable_length": null, "node_A": 69, "node_B": 70, "section_id": 4, "rotation_angle": 102, "fixity_A": "FFFFFF", "fixity_B": "FFFFFF", "offset_Ax": "0", "offset_Ay": "0", "offset_Az": "0", "offset_Bx": "0", "offset_By": "0", "offset_Bz": "0" }, "79": { "type": "normal", "cable_length": null, "node_A": 70, "node_B": 71, "section_id": 4, "rotation_angle": 102, "fixity_A": "FFFFFF", "fixity_B": "FFFFFF", "offset_Ax": "0", "offset_Ay": "0", "offset_Az": "0", "offset_Bx": "0", "offset_By": "0", "offset_Bz": "0" }, "80": { "type": "normal_continuous", "cable_length": null, "node_A": 3, "node_B": 4, "section_id": 3, "rotation_angle": 0, "fixity_A": "FFFFFF", "fixity_B": "FFFFFF", "offset_Ax": "0", "offset_Ay": "0", "offset_Az": "0", "offset_Bx": "0", "offset_By": "0", "offset_Bz": "0" }, "81": { "type": "normal", "cable_length": null, "node_A": 53, "node_B": 72, "section_id": 4, "rotation_angle": 102, "fixity_A": "FFFFFF", "fixity_B": "FFFFFF", "offset_Ax": "0", "offset_Ay": "0", "offset_Az": "0", "offset_Bx": "0", "offset_By": "0", "offset_Bz": "0" }, "82": { "type": "normal", "cable_length": null, "node_A": 72, "node_B": 73, "section_id": 4, "rotation_angle": 102, "fixity_A": "FFFFFF", "fixity_B": "FFFFFF", "offset_Ax": "0", "offset_Ay": "0", "offset_Az": "0", "offset_Bx": "0", "offset_By": "0", "offset_Bz": "0" }, "83": { "type": "normal_continuous", "cable_length": null, "node_A": 19, "node_B": 20, "section_id": 3, "rotation_angle": 0, "fixity_A": "FFFFFF", "fixity_B": "FFFFFF", "offset_Ax": "0", "offset_Ay": "0", "offset_Az": "0", "offset_Bx": "0", "offset_By": "0", "offset_Bz": "0" }, "84": { "type": "normal", "cable_length": null, "node_A": 73, "node_B": 74, "section_id": 4, "rotation_angle": 102, "fixity_A": "FFFFFF", "fixity_B": "FFFFFF", "offset_Ax": "0", "offset_Ay": "0", "offset_Az": "0", "offset_Bx": "0", "offset_By": "0", "offset_Bz": "0" }, "85": { "type": "normal_continuous", "cable_length": null, "node_A": 13, "node_B": 14, "section_id": 3, "rotation_angle": 0, "fixity_A": "FFFFFF", "fixity_B": "FFFFFF", "offset_Ax": "0", "offset_Ay": "0", "offset_Az": "0", "offset_Bx": "0", "offset_By": "0", "offset_Bz": "0" }, "86": { "type": "normal", "cable_length": null, "node_A": 74, "node_B": 75, "section_id": 4, "rotation_angle": 102, "fixity_A": "FFFFFF", "fixity_B": "FFFFFF", "offset_Ax": "0", "offset_Ay": "0", "offset_Az": "0", "offset_Bx": "0", "offset_By": "0", "offset_Bz": "0" }, "87": { "type": "normal", "cable_length": null, "node_A": 52, "node_B": 76, "section_id": 4, "rotation_angle": 78, "fixity_A": "FFFFFF", "fixity_B": "FFFFFF", "offset_Ax": "0", "offset_Ay": "0", "offset_Az": "0", "offset_Bx": "0", "offset_By": "0", "offset_Bz": "0" }, "88": { "type": "normal", "cable_length": null, "node_A": 76, "node_B": 77, "section_id": 4, "rotation_angle": 78, "fixity_A": "FFFFFF", "fixity_B": "FFFFFF", "offset_Ax": "0", "offset_Ay": "0", "offset_Az": "0", "offset_Bx": "0", "offset_By": "0", "offset_Bz": "0" }, "89": { "type": "normal", "cable_length": null, "node_A": 77, "node_B": 78, "section_id": 4, "rotation_angle": 78, "fixity_A": "FFFFFF", "fixity_B": "FFFFFF", "offset_Ax": "0", "offset_Ay": "0", "offset_Az": "0", "offset_Bx": "0", "offset_By": "0", "offset_Bz": "0" }, "90": { "type": "normal", "cable_length": null, "node_A": 78, "node_B": 79, "section_id": 4, "rotation_angle": 78, "fixity_A": "FFFFFF", "fixity_B": "FFFFFF", "offset_Ax": "0", "offset_Ay": "0", "offset_Az": "0", "offset_Bx": "0", "offset_By": "0", "offset_Bz": "0" }, "91": { "type": "normal", "cable_length": null, "node_A": 54, "node_B": 80, "section_id": 4, "rotation_angle": 78, "fixity_A": "FFFFFF", "fixity_B": "FFFFFF", "offset_Ax": "0", "offset_Ay": "0", "offset_Az": "0", "offset_Bx": "0", "offset_By": "0", "offset_Bz": "0" }, "92": { "type": "normal", "cable_length": null, "node_A": 80, "node_B": 81, "section_id": 4, "rotation_angle": 78, "fixity_A": "FFFFFF", "fixity_B": "FFFFFF", "offset_Ax": "0", "offset_Ay": "0", "offset_Az": "0", "offset_Bx": "0", "offset_By": "0", "offset_Bz": "0" }, "93": { "type": "normal", "cable_length": null, "node_A": 81, "node_B": 82, "section_id": 4, "rotation_angle": 78, "fixity_A": "FFFFFF", "fixity_B": "FFFFFF", "offset_Ax": "0", "offset_Ay": "0", "offset_Az": "0", "offset_Bx": "0", "offset_By": "0", "offset_Bz": "0" }, "94": { "type": "normal", "cable_length": null, "node_A": 82, "node_B": 83, "section_id": 4, "rotation_angle": 78, "fixity_A": "FFFFFF", "fixity_B": "FFFFFF", "offset_Ax": "0", "offset_Ay": "0", "offset_Az": "0", "offset_Bx": "0", "offset_By": "0", "offset_Bz": "0" }, "95": { "type": "normal", "cable_length": null, "node_A": 55, "node_B": 84, "section_id": 4, "rotation_angle": 78, "fixity_A": "FFFFFF", "fixity_B": "FFFFFF", "offset_Ax": "0", "offset_Ay": "0", "offset_Az": "0", "offset_Bx": "0", "offset_By": "0", "offset_Bz": "0" }, "96": { "type": "normal", "cable_length": null, "node_A": 84, "node_B": 85, "section_id": 4, "rotation_angle": 78, "fixity_A": "FFFFFF", "fixity_B": "FFFFFF", "offset_Ax": "0", "offset_Ay": "0", "offset_Az": "0", "offset_Bx": "0", "offset_By": "0", "offset_Bz": "0" }, "97": { "type": "normal", "cable_length": null, "node_A": 85, "node_B": 86, "section_id": 4, "rotation_angle": 78, "fixity_A": "FFFFFF", "fixity_B": "FFFFFF", "offset_Ax": "0", "offset_Ay": "0", "offset_Az": "0", "offset_Bx": "0", "offset_By": "0", "offset_Bz": "0" }, "98": { "type": "normal", "cable_length": null, "node_A": 86, "node_B": 87, "section_id": 4, "rotation_angle": 78, "fixity_A": "FFFFFF", "fixity_B": "FFFFFF", "offset_Ax": "0", "offset_Ay": "0", "offset_Az": "0", "offset_Bx": "0", "offset_By": "0", "offset_Bz": "0" }, "99": { "type": "normal", "cable_length": null, "node_A": 56, "node_B": 88, "section_id": 4, "rotation_angle": 78, "fixity_A": "FFFFFF", "fixity_B": "FFFFFF", "offset_Ax": "0", "offset_Ay": "0", "offset_Az": "0", "offset_Bx": "0", "offset_By": "0", "offset_Bz": "0" }, "100": { "type": "normal", "cable_length": null, "node_A": 88, "node_B": 89, "section_id": 4, "rotation_angle": 78, "fixity_A": "FFFFFF", "fixity_B": "FFFFFF", "offset_Ax": "0", "offset_Ay": "0", "offset_Az": "0", "offset_Bx": "0", "offset_By": "0", "offset_Bz": "0" }, "101": { "type": "normal", "cable_length": null, "node_A": 89, "node_B": 90, "section_id": 4, "rotation_angle": 78, "fixity_A": "FFFFFF", "fixity_B": "FFFFFF", "offset_Ax": "0", "offset_Ay": "0", "offset_Az": "0", "offset_Bx": "0", "offset_By": "0", "offset_Bz": "0" }, "102": { "type": "normal", "cable_length": null, "node_A": 90, "node_B": 91, "section_id": 4, "rotation_angle": 78, "fixity_A": "FFFFFF", "fixity_B": "FFFFFF", "offset_Ax": "0", "offset_Ay": "0", "offset_Az": "0", "offset_Bx": "0", "offset_By": "0", "offset_Bz": "0" }, "103": { "type": "normal", "cable_length": null, "node_A": 2, "node_B": 93, "section_id": 4, "rotation_angle": 180, "fixity_A": "FFFFFF", "fixity_B": "FFFFFF", "offset_Ax": "0", "offset_Ay": "0", "offset_Az": "0", "offset_Bx": "0", "offset_By": "0", "offset_Bz": "0" }, "104": { "type": "normal", "cable_length": null, "node_A": 93, "node_B": 4, "section_id": 4, "rotation_angle": 180, "fixity_A": "FFFFFF", "fixity_B": "FFFFFF", "offset_Ax": "0", "offset_Ay": "0", "offset_Az": "0", "offset_Bx": "0", "offset_By": "0", "offset_Bz": "0" }, "105": { "type": "normal", "cable_length": null, "node_A": 19, "node_B": 92, "section_id": 4, "rotation_angle": 180, "fixity_A": "FFFFFF", "fixity_B": "FFFFFF", "offset_Ax": "0", "offset_Ay": "0", "offset_Az": "0", "offset_Bx": "0", "offset_By": "0", "offset_Bz": "0" }, "106": { "type": "normal", "cable_length": null, "node_A": 92, "node_B": 13, "section_id": 4, "rotation_angle": 180, "fixity_A": "FFFFFF", "fixity_B": "FFFFFF", "offset_Ax": "0", "offset_Ay": "0", "offset_Az": "0", "offset_Bx": "0", "offset_By": "0", "offset_Bz": "0" } }, "plates": {}, "meshed_plates": {}, "sections": { "1": { "name": "C15015", "material_id": 8, "area": 443, "Iy": 237000, "Iz": 1610000, "J": 332, "shear_area_y": null, "shear_area_z": null, "color": { "r": 148, "g": 0, "b": 211, "a": 1 }, "aux": { "composite": false, "Qz": 13664.376, "Qy": 5166.84506, "centroid_point": [18.4, 76], "centroid_length": [18.4, 76], "depth": 152, "width": 64, "alpha": 0, "Zy": 9323.2983, "Zz": 27328.752, "polygons": [{ "name": "C15015", "group_id": 0, "points_calc": [[0, 0, "regular"], [64, 0, "regular"], [64, 15.5, "regular"], [62.5, 15.5, "regular"], [62.5, 6.500000000000001, "filletStartEnd"], [62.11939766255644, 4.586582838174552, "dontShow"], [61.03553390593274, 2.9644660940672636, "dontShow"], [59.41341716182545, 1.880602337443567, "dontShow"], [57.5, 1.5000000000000009, "filletStartEnd"], [6.5, 1.5, "filletStartEnd"], [4.586582838174549, 1.8806023374435679, "dontShow"], [2.9644660940672622, 2.9644660940672627, "dontShow"], [1.880602337443567, 4.586582838174552, "dontShow"], [1.5000000000000009, 6.500000000000001, "filletStartEnd"], [1.5, 145.5, "filletStartEnd"], [1.880602337443566, 147.41341716182544, "dontShow"], [2.9644660940672627, 149.03553390593274, "dontShow"], [4.586582838174552, 150.11939766255642, "dontShow"], [6.5, 150.5, "filletStartEnd"], [57.5, 150.5, "filletStartEnd"], [59.41341716182545, 150.11939766255642, "dontShow"], [61.03553390593274, 149.03553390593274, "dontShow"], [62.11939766255644, 147.41341716182544, "dontShow"], [62.5, 145.5, "filletStartEnd"], [62.5, 136.5, "regular"], [64, 136.5, "regular"], [64, 152, "regular"], [0, 152, "regular"]], "points_custom_orig": [], "shape": "lipped channel", "dimensions_show": true, "dimensions": { "h": { "value": 152, "locat": [[-15.200000000000001, 152], [-15.200000000000001, 0], { "placeholder": "Height", "dimension_id": "h", "dimension": 152 }] }, "TFw": { "value": 64, "locat": [[0, 167.2], [64, 167.2], { "placeholder": "Top Width", "dimension_id": "TFw", "dimension": 64 }] }, "TFt": { "value": 1.5, "locat": [[79.2, 152], [79.2, 150.5], { "placeholder": "Top Thickness", "dimension_id": "TFt", "dimension": 1.5 }] }, "BFw": { "value": 64, "locat": [[0, -30.400000000000002], [64, -30.400000000000002], { "placeholder": "Bottom Width", "dimension_id": "BFw", "dimension": 64 }] }, "BFt": { "value": 1.5, "locat": [[79.2, 0], [79.2, 1.5], { "placeholder": "Bottom Thickness", "dimension_id": "BFt", "dimension": 1.5 }] }, "Wt": { "value": 1.5, "locat": [[0, -15.200000000000001], [1.5, -15.200000000000001], { "placeholder": "Web Thickness", "dimension_id": "Wt", "dimension": 1.5 }] }, "d": { "value": 15.5, "locat": [[94.4, 152], [94.4, 136.5], { "placeholder": "Lip Depth", "dimension_id": "d", "dimension": 15.5 }] } }, "operations": { "rotation": 0, "translation": [0, 0], "mirror_z": false, "mirror_y": false, "fillet_radius": 5 }, "cutout": false, "material": { "name": "Australian/New Zealand Standard (AS/NZS) - AS/NZS 3678 - Grade 450, 450L15 - Thickness ≤ 8mm", "density": 7850, "elasticity_modulus": 200000, "poissons_ratio": 0.29, "yield_strength": 450, "ultimate_strength": 520, "aux": { "units": { "E": "material_strength", "density": "density", "Fu": "material_strength", "Fy": "material_strength", "alpha": "thermal_expansion", "v": null }, "selections": ["Metric", "Steel", "Australian/New Zealand Standard (AS/NZS)", "AS/NZS 3678", "Grade 450, 450L15", "Thickness ≤ 8mm"] }, "class": "steel", "id": 8 }, "type": "library", "library_selections": ["Australian", "Cold Formed Steel (Lysaght)", "Channels (Lipped)", "C15015"], "results": { "A": 443, "J": 332, "Iyp": 237000, "Izp": 1610000, "Iy": 0, "Iz": 0, "Alpha": 0, "Cy": 76, "Cz": 18.4, "ry": 0, "rz": 0, "ryp": 23.1, "rzp": 60.2, "Iw": 1070000000, "Syp": 0, "Szp": 0, "basis": { "shape": "lipped channel", "dimensions": { "h": 152, "TFw": 64, "TFt": 1.5, "BFw": 64, "BFt": 1.5, "Wt": 1.5, "d": 15.5, "r": 5 }, "operations": { "rotation": 0, "mirror_z": false, "mirror_y": false, "translation": [0, 0] } } }, "points_centroid_shifted": [[-18.4, -76, "regular"], [45.6, -76, "regular"], [45.6, -60.5, "regular"], [44.1, -60.5, "regular"], [44.1, -69.5, "filletStartEnd"], [39.1, -74.5, "filletStartEnd"], [-11.899999999999999, -74.5, "filletStartEnd"], [-16.9, -69.5, "filletStartEnd"], [-16.9, 69.5, "filletStartEnd"], [-11.899999999999999, 74.5, "filletStartEnd"], [39.1, 74.5, "filletStartEnd"], [44.1, 69.5, "filletStartEnd"], [44.1, 60.5, "regular"], [45.6, 60.5, "regular"], [45.6, 76, "regular"], [-18.4, 76, "regular"]] }], "warping_constant": 1070000000, "shear_area_z": 139.08704453441297, "shear_area_y": 189.04960870402618, "torsion_radius": 2.96862 }, "version": 3 }, "3": { "name": "C15019", "material_id": 8, "area": 561, "Iy": 300000, "Iz": 2020000, "J": 675, "shear_area_y": null, "shear_area_z": null, "color": { "r": 0, "g": 0, "b": 205, "a": 1 }, "aux": { "composite": false, "Qz": 17050.87734, "Qy": 6460.07837, "centroid_point": [18.5, 76], "centroid_length": [18.5, 76], "depth": 152, "width": 64, "alpha": 0, "Zy": 11684.1581, "Zz": 34101.7547, "polygons": [{ "name": "C15019", "group_id": 0, "points_calc": [[0, 0, "regular"], [64, 0, "regular"], [64, 16.5, "regular"], [62.1, 16.5, "regular"], [62.1, 6.900000000000001, "filletStartEnd"], [61.71939766255643, 4.986582838174552, "dontShow"], [60.63553390593274, 3.364466094067264, "dontShow"], [59.01341716182545, 2.2806023374435673, "dontShow"], [57.1, 1.9000000000000012, "filletStartEnd"], [6.899999999999999, 1.9000000000000004, "filletStartEnd"], [4.986582838174548, 2.280602337443568, "dontShow"], [3.364466094067261, 3.364466094067263, "dontShow"], [2.2806023374435656, 4.986582838174552, "dontShow"], [1.8999999999999995, 6.900000000000001, "filletStartEnd"], [1.8999999999999986, 145.1, "filletStartEnd"], [2.2806023374435647, 147.01341716182543, "dontShow"], [3.3644660940672613, 148.63553390593273, "dontShow"], [4.9865828381745505, 149.71939766255642, "dontShow"], [6.899999999999999, 150.1, "filletStartEnd"], [57.1, 150.1, "filletStartEnd"], [59.01341716182545, 149.71939766255642, "dontShow"], [60.63553390593274, 148.63553390593273, "dontShow"], [61.71939766255643, 147.01341716182543, "dontShow"], [62.1, 145.1, "filletStartEnd"], [62.1, 135.5, "regular"], [64, 135.5, "regular"], [64, 152, "regular"], [0, 152, "regular"]], "points_custom_orig": [], "shape": "lipped channel", "dimensions_show": true, "dimensions": { "h": { "value": 152, "locat": [[-15.200000000000001, 152], [-15.200000000000001, 0], { "placeholder": "Height", "dimension_id": "h", "dimension": 152 }] }, "TFw": { "value": 64, "locat": [[0, 167.2], [64, 167.2], { "placeholder": "Top Width", "dimension_id": "TFw", "dimension": 64 }] }, "TFt": { "value": 1.9, "locat": [[79.2, 152], [79.2, 150.1], { "placeholder": "Top Thickness", "dimension_id": "TFt", "dimension": 1.9 }] }, "BFw": { "value": 64, "locat": [[0, -30.400000000000002], [64, -30.400000000000002], { "placeholder": "Bottom Width", "dimension_id": "BFw", "dimension": 64 }] }, "BFt": { "value": 1.9, "locat": [[79.2, 0], [79.2, 1.9], { "placeholder": "Bottom Thickness", "dimension_id": "BFt", "dimension": 1.9 }] }, "Wt": { "value": 1.9, "locat": [[0, -15.200000000000001], [1.9, -15.200000000000001], { "placeholder": "Web Thickness", "dimension_id": "Wt", "dimension": 1.9 }] }, "d": { "value": 16.5, "locat": [[94.4, 152], [94.4, 135.5], { "placeholder": "Lip Depth", "dimension_id": "d", "dimension": 16.5 }] } }, "operations": { "rotation": 0, "translation": [0, 0], "mirror_z": false, "mirror_y": false, "fillet_radius": 5 }, "cutout": false, "material": { "name": "Australian/New Zealand Standard (AS/NZS) - AS/NZS 3678 - Grade 450, 450L15 - Thickness ≤ 8mm", "density": 7850, "elasticity_modulus": 200000, "poissons_ratio": 0.29, "yield_strength": 450, "ultimate_strength": 520, "aux": { "units": { "E": "material_strength", "density": "density", "Fu": "material_strength", "Fy": "material_strength", "alpha": "thermal_expansion", "v": null }, "selections": ["Metric", "Steel", "Australian/New Zealand Standard (AS/NZS)", "AS/NZS 3678", "Grade 450, 450L15", "Thickness ≤ 8mm"] }, "class": "steel", "id": 8 }, "type": "library", "library_selections": ["Australian", "Cold Formed Steel (Lysaght)", "Channels (Lipped)", "C15019"], "results": { "A": 561, "J": 675, "Iyp": 300000, "Izp": 2020000, "Iy": 0, "Iz": 0, "Alpha": 0, "Cy": 76, "Cz": 18.5, "ry": 0, "rz": 0, "ryp": 23.1, "rzp": 60, "Iw": 1370000000, "Syp": 0, "Szp": 0, "basis": { "shape": "lipped channel", "dimensions": { "h": 152, "TFw": 64, "TFt": 1.9, "BFw": 64, "BFt": 1.9, "Wt": 1.9, "d": 16.5, "r": 5 }, "operations": { "rotation": 0, "mirror_z": false, "mirror_y": false, "translation": [0, 0] } } }, "points_centroid_shifted": [[-18.5, -76, "regular"], [45.5, -76, "regular"], [45.5, -59.5, "regular"], [43.6, -59.5, "regular"], [43.6, -69.1, "filletStartEnd"], [38.6, -74.1, "filletStartEnd"], [-11.600000000000001, -74.1, "filletStartEnd"], [-16.6, -69.1, "filletStartEnd"], [-16.6, 69.1, "filletStartEnd"], [-11.600000000000001, 74.1, "filletStartEnd"], [38.6, 74.1, "filletStartEnd"], [43.6, 69.1, "filletStartEnd"], [43.6, 59.5, "regular"], [45.5, 59.5, "regular"], [45.5, 76, "regular"], [-18.5, 76, "regular"]] }], "warping_constant": 1370000000, "shear_area_z": 173.91941877347836, "shear_area_y": 237.72740159712706, "torsion_radius": 3.7744 }, "version": 3 }, "4": { "name": "TH75101", "material_id": 8, "area": 249, "Iy": 200459.75, "Iz": 169905.87851, "J": 112.999, "shear_area_y": null, "shear_area_z": null, "color": { "r": 0, "g": 128, "b": 0, "a": 1 }, "aux": { "composite": false, "Qz": 2874.05246, "Qy": 3291.625, "centroid_point": [50.5, 38.68876], "centroid_length": [50.5, 38.68875502008032], "depth": 75, "width": 101, "alpha": 0, "Zy": 6583.25, "Zz": 5747.7124, "polygons": [{ "name": "Points Shape", "group_id": 0, "points_calc": [[0, 0, "regular"], [14, 0, "regular"], [33.5, 74, "regular"], [67.5, 74, "regular"], [87, 0, "regular"], [101, 0, "regular"], [101, 1, "regular"], [88, 1, "regular"], [68.5, 75, "regular"], [32.5, 75, "regular"], [13, 1, "regular"], [0, 1, "regular"]], "points_custom_orig": [[0, 0, 0], [14, 0, 0], [33.5, 74, 0], [67.5, 74, 0], [87, 0, 0], [101, 0, 0], [101, 1, 0], [88, 1, 0], [68.5, 75, 0], [32.5, 75, 0], [13, 1, 0], [0, 1, 0], []], "shape": "pointsShape", "dimensions_show": false, "dimensions": [], "operations": { "rotation": 0, "translation": [0, 0], "mirror_z": false, "mirror_y": false, "fillet_radius": null }, "cutout": false, "material": { "name": "Australian/New Zealand Standard (AS/NZS) - AS/NZS 3678 - Grade 450, 450L15 - Thickness ≤ 8mm", "density": 7850, "elasticity_modulus": 200000, "poissons_ratio": 0.29, "yield_strength": 450, "ultimate_strength": 520, "aux": { "units": { "E": "material_strength", "density": "density", "Fu": "material_strength", "Fy": "material_strength", "alpha": "thermal_expansion", "v": null }, "selections": ["Metric", "Steel", "Australian/New Zealand Standard (AS/NZS)", "AS/NZS 3678", "Grade 450, 450L15", "Thickness ≤ 8mm"] }, "class": "steel", "id": 8 }, "type": "custom", "points_centroid_shifted": [[-50.5, -38.68875502008032, "regular"], [-36.5, -38.68875502008032, "regular"], [-17, 35.31124497991968, "regular"], [17, 35.31124497991968, "regular"], [36.5, -38.68875502008032, "regular"], [50.5, -38.68875502008032, "regular"], [50.5, -37.68875502008032, "regular"], [37.5, -37.68875502008032, "regular"], [18, 36.31124497991968, "regular"], [-18, 36.31124497991968, "regular"], [-37.5, -37.68875502008032, "regular"], [-50.5, -37.68875502008032, "regular"]] }], "warping_constant": 18344000, "shear_area_z": 160.5529728091612, "shear_area_y": 42.83981522103796, "torsion_radius": 1.24937 }, "version": 3 }, "5": { "name": "LC08330", "material_id": 1, "area": 420, "Iy": 45300, "Iz": 415000, "J": 1260, "shear_area_y": null, "shear_area_z": null, "color": { "r": 219, "g": 112, "b": 147, "a": 1 }, "aux": { "composite": false, "Qz": 6394.06536, "Qy": 1918.11938, "centroid_point": [9.18, 41.5], "centroid_length": [9.18, 41.5], "depth": 83, "width": 34, "alpha": 0, "Zy": 3249.9221, "Zz": 12788.1307, "polygons": [{ "name": "LC08330", "group_id": 0, "points_calc": [[0, 0, "regular"], [34, 0, "regular"], [34, 3, "regular"], [6.2, 3, "filletStartEnd"], [4.975413016431712, 3.2435854959638832, "dontShow"], [3.9372583002030486, 3.937258300203048, "dontShow"], [3.243585495963883, 4.975413016431713, "dontShow"], [3.000000000000001, 6.2, "filletStartEnd"], [3, 76.8, "filletStartEnd"], [3.2435854959638823, 78.02458698356828, "dontShow"], [3.937258300203048, 79.06274169979694, "dontShow"], [4.9754130164317125, 79.75641450403612, "dontShow"], [6.2, 80, "filletStartEnd"], [34, 80, "regular"], [34, 83, "regular"], [0, 83, "regular"]], "points_custom_orig": [], "shape": "channel", "dimensions_show": true, "dimensions": { "h": { "value": 83, "locat": [[-8.3, 83], [-8.3, 0], { "placeholder": "Height", "dimension_id": "h", "dimension": 83 }] }, "TFw": { "value": 34, "locat": [[0, 91.3], [34, 91.3], { "placeholder": "Top Width", "dimension_id": "TFw", "dimension": 34 }] }, "TFt": { "value": 3, "locat": [[42.3, 83], [42.3, 80], { "placeholder": "Top Thickness", "dimension_id": "TFt", "dimension": 3 }] }, "BFw": { "value": 34, "locat": [[0, -16.6], [34, -16.6], { "placeholder": "Bottom Width", "dimension_id": "BFw", "dimension": 34 }] }, "BFt": { "value": 3, "locat": [[42.3, 0], [42.3, 3], { "placeholder": "Bottom Thickness", "dimension_id": "BFt", "dimension": 3 }] }, "Wt": { "value": 3, "locat": [[0, -8.3], [3, -8.3], { "placeholder": "Web Thickness", "dimension_id": "Wt", "dimension": 3 }] } }, "operations": { "rotation": 0, "translation": [0, 0], "mirror_z": false, "mirror_y": false, "fillet_radius": 3.2 }, "cutout": false, "material": { "id": 1, "name": "Structural Steel", "density": 7850, "elasticity_modulus": 200000, "poissons_ratio": 0.27, "yield_strength": 260, "ultimate_strength": 410, "class": "steel" }, "type": "library", "library_selections": ["Australian", "Cold Formed Steel (Lysaght)", "Channels", "LC08330"], "results": { "A": 420, "J": 1260, "Iyp": 45300, "Izp": 415000, "Iy": 0, "Iz": 0, "Alpha": 0, "Cy": 41.5, "Cz": 9.18, "ry": 0, "rz": 0, "ryp": 10.39, "rzp": 31.4, "Iw": 52400000, "Syp": 0, "Szp": 0, "basis": { "shape": "channel", "dimensions": { "h": 83, "TFw": 34, "TFt": 3, "BFw": 34, "BFt": 3, "Wt": 3, "r": 3.2 }, "operations": { "rotation": 0, "mirror_z": false, "mirror_y": false, "translation": [0, 0] } } }, "points_centroid_shifted": [[-9.18, -41.5, "regular"], [24.82, -41.5, "regular"], [24.82, -38.5, "regular"], [-2.9799999999999995, -38.5, "filletStartEnd"], [-6.179999999999999, -35.3, "filletStartEnd"], [-6.18, 35.3, "filletStartEnd"], [-2.9799999999999995, 38.5, "filletStartEnd"], [24.82, 38.5, "regular"], [24.82, 41.5, "regular"], [-9.18, 41.5, "regular"]] }], "warping_constant": 52400000, "shear_area_z": 120.38370157882059, "shear_area_y": 216.33619777960322, "torsion_radius": 4.24988 }, "version": 3 }, "6": { "name": "30 x 1", "material_id": 8, "area": 30, "Iy": 2.5, "Iz": 2250, "J": 9.77178, "shear_area_y": null, "shear_area_z": null, "color": { "r": 255, "g": 0, "b": 0, "a": 1 }, "aux": { "composite": false, "Qz": 112.5, "Qy": 3.75, "centroid_point": [0.5, 15], "centroid_length": [0.5, 15], "depth": 30, "width": 1, "alpha": 0, "Zy": 7.5, "Zz": 225, "polygons": [{ "name": "Rectangular", "group_id": 0, "points_calc": [[0, 0, "regular"], [1, 0, "regular"], [1, 30, "regular"], [0, 30, "regular"]], "points_custom_orig": [], "shape": "rectangle", "dimensions_show": true, "dimensions": { "h": { "value": 30, "locat": [[4, 0], [4, 30], { "placeholder": "Height", "dimension_id": "h", "dimension": 30 }] }, "b": { "value": 1, "locat": [[0, -3], [1, -3], { "placeholder": "Width", "dimension_id": "b", "dimension": 1 }] } }, "operations": { "rotation": 0, "translation": [0, 0], "mirror_z": false, "mirror_y": false }, "cutout": false, "material": { "name": "Australian/New Zealand Standard (AS/NZS) - AS/NZS 3678 - Grade 450, 450L15 - Thickness ≤ 8mm", "density": 7850, "elasticity_modulus": 200000, "poissons_ratio": 0.29, "yield_strength": 450, "ultimate_strength": 520, "aux": { "units": { "E": "material_strength", "density": "density", "Fu": "material_strength", "Fy": "material_strength", "alpha": "thermal_expansion", "v": null }, "selections": ["Metric", "Steel", "Australian/New Zealand Standard (AS/NZS)", "AS/NZS 3678", "Grade 450, 450L15", "Thickness ≤ 8mm"] }, "class": "steel", "id": 8 }, "type": "standard", "points_centroid_shifted": [[-0.5, -15, "regular"], [0.5, -15, "regular"], [0.5, 15, "regular"], [-0.5, 15, "regular"]] }], "warping_constant": 186.647, "shear_area_z": 25.685811157916365, "shear_area_y": 25, "torsion_radius": 1 }, "version": 3 } }, "materials": { "1": { "id": 1, "name": "Structural Steel", "density": 7850, "elasticity_modulus": 200000, "poissons_ratio": 0.27, "yield_strength": 260, "ultimate_strength": 410, "class": "steel" }, "2": { "id": 2, "name": "Aluminium", "density": 2700, "elasticity_modulus": 69000, "poissons_ratio": 0.32, "yield_strength": 100, "ultimate_strength": 150, "class": "aluminium" }, "3": { "id": 3, "name": "Carbon Fibre Reinforced Plastic", "density": 3500, "elasticity_modulus": 150000, "poissons_ratio": 0.2, "yield_strength": null, "ultimate_strength": 2705, "class": "other" }, "4": { "id": 4, "name": "Concrete", "density": 2500, "elasticity_modulus": 17000, "poissons_ratio": 0.2, "yield_strength": null, "ultimate_strength": 3.5, "class": "concrete" }, "5": { "id": 5, "name": "Concrete High Strength", "density": 2500, "elasticity_modulus": 30000, "poissons_ratio": 0.2, "yield_strength": null, "ultimate_strength": 5, "class": "concrete" }, "6": { "id": 6, "name": "Oakwood", "density": 900, "elasticity_modulus": 11000, "poissons_ratio": 0.3, "yield_strength": 4.5, "ultimate_strength": 5, "class": "wood" }, "7": { "id": 7, "name": "Glass", "density": 2500, "elasticity_modulus": 70000, "poissons_ratio": 0.24, "yield_strength": null, "ultimate_strength": 33, "class": "other" }, "8": { "name": "Australian/New Zealand Standard (AS/NZS) - AS/NZS 3678 - Grade 450, 450L15 - Thickness ≤ 8mm", "density": 7850, "elasticity_modulus": 200000, "poissons_ratio": 0.29, "yield_strength": 450, "ultimate_strength": 520, "aux": { "units": { "E": "material_strength", "density": "density", "Fu": "material_strength", "Fy": "material_strength", "alpha": "thermal_expansion", "v": null }, "selections": ["Metric", "Steel", "Australian/New Zealand Standard (AS/NZS)", "AS/NZS 3678", "Grade 450, 450L15", "Thickness ≤ 8mm"] }, "class": "steel", "id": 8 } }, "supports": { "1": { "tx": 0, "ty": 0, "tz": 0, "rx": 0, "ry": 0, "rz": 0, "direction_code": "BBBBBB", "node": 1, "restraint_code": "FFFFRR" }, "2": { "tx": 0, "ty": 0, "tz": 0, "rx": 0, "ry": 0, "rz": 0, "direction_code": "BBBBBB", "node": 3, "restraint_code": "FFFFRR" }, "3": { "tx": 0, "ty": 0, "tz": 0, "rx": 0, "ry": 0, "rz": 0, "direction_code": "BBBBBB", "node": 6, "restraint_code": "FFFFRR" }, "4": { "tx": 0, "ty": 0, "tz": 0, "rx": 0, "ry": 0, "rz": 0, "direction_code": "BBBBBB", "node": 16, "restraint_code": "FFFFRR" }, "5": { "tx": 0, "ty": 0, "tz": 0, "rx": 0, "ry": 0, "rz": 0, "direction_code": "BBBBBB", "node": 18, "restraint_code": "FFFFRR" }, "6": { "tx": 0, "ty": 0, "tz": 0, "rx": 0, "ry": 0, "rz": 0, "direction_code": "BBBBBB", "node": 20, "restraint_code": "FFFFRR" }, "7": { "tx": 0, "ty": 0, "tz": 0, "rx": 0, "ry": 0, "rz": 0, "direction_code": "BBBBBB", "node": 27, "restraint_code": "FFFFRR" }, "8": { "tx": 0, "ty": 0, "tz": 0, "rx": 0, "ry": 0, "rz": 0, "direction_code": "BBBBBB", "node": 26, "restraint_code": "FFFFRR" }, "9": { "tx": 0, "ty": 0, "tz": 0, "rx": 0, "ry": 0, "rz": 0, "direction_code": "BBBBBB", "node": 8, "restraint_code": "FFFFRR" }, "10": { "tx": 0, "ty": 0, "tz": 0, "rx": 0, "ry": 0, "rz": 0, "direction_code": "BBBBBB", "node": 10, "restraint_code": "FFFFRR" }, "11": { "tx": 0, "ty": 0, "tz": 0, "rx": 0, "ry": 0, "rz": 0, "direction_code": "BBBBBB", "node": 12, "restraint_code": "FFFFRR" }, "12": { "tx": 0, "ty": 0, "tz": 0, "rx": 0, "ry": 0, "rz": 0, "direction_code": "BBBBBB", "node": 14, "restraint_code": "FFFFRR" } }, "settlements": {}, "point_loads": {}, "moments": {}, "distributed_loads": {}, "pressures": {}, "area_loads": { "1": { "type": "column_wind_load", "nodes": "14,13,2,1", "members": 0, "mag": 0, "direction": null, "elevations": "0,3.625", "mags": "0.30922000000000005", "column_direction": "14,13", "loaded_members_axis": null, "LG": "W_Cond6_Comb2_Cpi_pos" }, "2": { "type": "column_wind_load", "nodes": "14,13,2,1", "members": 0, "mag": 0, "direction": null, "elevations": "0,3.625", "mags": "0.30922000000000005", "column_direction": "14,13", "loaded_members_axis": null, "LG": "W_Cond6_Comb2_Cpi_neg" }, "3": { "type": "open_structure", "nodes": "3,4,19,20", "members": 0, "mag": -5, "direction": "Y", "elevations": 0, "mags": "0", "column_direction": "3,4", "loaded_members_axis": "major", "LG": "TEST" }, "4": { "type": "column_wind_load", "nodes": "3,4,19,20", "members": 0, "mag": 0, "direction": null, "elevations": "0,3.625", "mags": "-0.13252000000000003", "column_direction": "3,4", "loaded_members_axis": null, "LG": "W_Cond6_Comb2_Cpi_neg" }, "5": { "type": "column_wind_load", "nodes": "13,25,21,2", "members": 0, "mag": 0, "direction": null, "elevations": "0,8", "mags": "-0.27388", "column_direction": "13,25", "loaded_members_axis": null, "LG": "W_Cond6_Comb2_Cpi_pos" }, "6": { "type": "column_wind_load", "nodes": "13,25,21,2", "members": 0, "mag": 0, "direction": null, "elevations": "0,8", "mags": "-0.07951000000000001", "column_direction": "13,25", "loaded_members_axis": null, "LG": "W_Cond6_Comb2_Cpi_neg" }, "7": { "type": "column_wind_load", "nodes": "4,21,25,19", "members": 0, "mag": 0, "direction": null, "elevations": "0,8", "mags": "-0.16786", "column_direction": "4,21", "loaded_members_axis": null, "LG": "W_Cond6_Comb2_Cpi_pos" }, "8": { "type": "column_wind_load", "nodes": "4,21,25,19", "members": 0, "mag": 0, "direction": null, "elevations": "0,8", "mags": "-0.16786", "column_direction": "4,21", "loaded_members_axis": null, "LG": "W_Cond6_Comb2_Cpi_neg" }, "9": { "LG": "WL_alongL_Case1", "column_direction": "14,13", "elevations": "0,3.625", "mags": "0.30922000000000005", "members": 0, "nodes": "14,13,2,1", "type": "column_wind_load", "generated_from": "wind_module" }, "10": { "LG": "WL_alongL_Case2", "column_direction": "14,13", "elevations": "0,3.625", "mags": "0.30922000000000005", "members": 0, "nodes": "14,13,2,1", "type": "column_wind_load", "generated_from": "wind_module" }, "11": { "LG": "WL_alongL_Case1", "column_direction": "3,4", "elevations": "0,3.625", "mags": "-0.19261000000000003", "members": 0, "nodes": "3,4,19,20", "type": "column_wind_load", "generated_from": "wind_module" }, "12": { "LG": "WL_alongL_Case2", "column_direction": "3,4", "elevations": "0,3.625", "mags": "-0.19261000000000003", "members": 0, "nodes": "3,4,19,20", "type": "column_wind_load", "generated_from": "wind_module" }, "13": { "type": "one_way", "nodes": "4,21,25,19", "members": 0, "mag": -0.25, "direction": "Z", "elevations": 0, "mags": "0", "column_direction": "4,21", "loaded_members_axis": "all", "LG": "LL" }, "14": { "type": "one_way", "nodes": "2,21,25,13", "members": 0, "mag": -0.25, "direction": "Z", "elevations": 0, "mags": "0", "column_direction": "2,21", "loaded_members_axis": "all", "LG": "LL" }, "15": { "type": "one_way", "nodes": "4,21,25,19", "members": 0, "mag": -0.05, "direction": "Z", "elevations": 0, "mags": "0", "column_direction": "4,21", "loaded_members_axis": "all", "LG": "DL" }, "16": { "type": "one_way", "nodes": "13,25,21,2", "members": 0, "mag": -0.05, "direction": "Z", "elevations": 0, "mags": "0", "column_direction": "13,25", "loaded_members_axis": "all", "LG": "DL" }, "17": { "type": "one_way", "nodes": "14,13,2,1", "members": 0, "mag": -0.05, "direction": "Z", "elevations": 0, "mags": "0", "column_direction": "14,13", "loaded_members_axis": "all", "LG": "DL" }, "18": { "type": "one_way", "nodes": "1,2,4,3", "members": 0, "mag": -0.05, "direction": "Z", "elevations": 0, "mags": "0", "column_direction": "1,2", "loaded_members_axis": "all", "LG": "DL" }, "19": { "type": "one_way", "nodes": "3,4,19,20", "members": 0, "mag": -0.05, "direction": "Z", "elevations": 0, "mags": "0", "column_direction": "3,4", "loaded_members_axis": "all", "LG": "DL" }, "20": { "type": "one_way", "nodes": "20,19,13,14", "members": 0, "mag": -0.05, "direction": "Z", "elevations": 0, "mags": "0", "column_direction": "20,19", "loaded_members_axis": "all", "LG": "DL" }, "21": { "LG": "WL_alongB_Case1", "column_direction": "1,2", "elevations": "0,3.625", "mags": "0.30922000000000005", "members": 0, "nodes": "1,2,4,3", "type": "column_wind_load", "generated_from": "wind_module" }, "22": { "LG": "WL_alongB_Case2", "column_direction": "1,2", "elevations": "0,3.625", "mags": "0.30922000000000005", "members": 0, "nodes": "1,2,4,3", "type": "column_wind_load", "generated_from": "wind_module" }, "23": { "LG": "WL_alongB_Case1", "column_direction": "20,19", "elevations": "0,3.625", "mags": "-0.13252000000000003", "members": 0, "nodes": "20,19,13,14", "type": "column_wind_load", "generated_from": "wind_module" }, "24": { "LG": "WL_alongB_Case2", "column_direction": "20,19", "elevations": "0,3.625", "mags": "-0.13252000000000003", "members": 0, "nodes": "20,19,13,14", "type": "column_wind_load", "generated_from": "wind_module" } }, "member_prestress_loads": {}, "self_weight": { "1": { "x": 0, "y": 0, "z": -1, "LG": "SW1" } }, "load_combinations": { "1": { "SW1": 1.35, "W_Cond6_Comb2_Cpi_pos": 0, "W_Cond6_Comb2_Cpi_neg": 0, "LL": 0, "DL": 1.35, "name": "ULS: Permanent", "WL_alongL_Case1": 0, "WL_alongL_Case2": 0, "WL_alongB_Case1": 0, "WL_alongB_Case2": 0 }, "2": { "SW1": 1.2, "W_Cond6_Comb2_Cpi_pos": 0, "W_Cond6_Comb2_Cpi_neg": 0, "LL": 1.5, "DL": 1.2, "name": "ULS: Permanent & Imposed", "WL_alongL_Case1": 0, "WL_alongL_Case2": 0, "WL_alongB_Case1": 0, "WL_alongB_Case2": 0 }, "3": { "name": "ULS: Permanent, Wind Case 1 Pos Cpi", "SW1": 0.9, "W_Cond6_Comb2_Cpi_pos": 1, "W_Cond6_Comb2_Cpi_neg": 0, "LL": 0, "DL": 0.9, "WL_alongL_Case1": 0, "WL_alongL_Case2": 0, "WL_alongB_Case1": 0, "WL_alongB_Case2": 0 }, "4": { "SW1": 1, "W_Cond6_Comb2_Cpi_pos": 0, "W_Cond6_Comb2_Cpi_neg": 0, "LL": 0.7, "DL": 1, "name": "SLS: Permanent & short-term Imposed", "WL_alongL_Case1": 0, "WL_alongL_Case2": 0, "WL_alongB_Case1": 0, "WL_alongB_Case2": 0 } }, "load_cases": { "AS": { "SW1": "Dead: G-permanent", "W_Cond6_Comb2_Cpi_pos": "Wind: Wu-wind", "W_Cond6_Comb2_Cpi_neg": "Wind: Wu-wind", "WL_alongB_Case1": "Wind: Wu-wind", "WL_alongB_Case2": "Wind: Wu-wind", "LL": "Live: Q-distr-roof-other", "DL": "Dead: G-permanent" } }, "nodal_masses": {}, "nodal_masses_conversion_map": {}, "spectral_loads": {}, "groups": [null, null]
// 	});
// }, 2000);