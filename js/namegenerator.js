/* global network, extend */
/* exported Namegenerator */
var Namegenerator = function Namegenerator(options) {

  //global vars
  var namegenerator = {};
  namegenerator.options = {
    targetEl: $('.container'),
    variables: [],
    heading: "This is a default heading",
    subheading: "And this is a default subheading"
  };

  extend(namegenerator.options, options);

  var nodeBoxOpen = false;
  var editing = false;

  var alterCount = network.getNodes({type_t0: 'Alter'}).length;

  var relationshipTypes = {
    'Friend': ['Best Friend','Friend','Ex-friend','Other type'],
    'Family/Relative': ['Parent/Guardian','Brother/Sister','Grandparent','Other Family','Chosen Family'],
    'Romantic/Sexual Partner': ['Boyfriend/Girlfriend','Ex-Boyfriend/Ex-Girlfriend','Booty Call/Fuck Buddy/Hook Up','One Night Stand','Other type of Partner'],
    'Acquaintaince/Associate': ['Coworker-Colleague','Classmate','Roommate','Friend of a Friend','Neighbor','Other'],
    'Other Support/Source of Advice': ['Teacher/Professor','Counselor/Therapist','Community Agency Staff','Religious Leader','Mentor','Coach','Other'],
    'Drug Use': ['Someone you use drugs with','Someone you buy drugs from'],
    'Other': []
  };

  var keyPressHandler = function(e) {
    if (e.keyCode === 13) {
      e.preventDefault();
      if (nodeBoxOpen === false) {
        namegenerator.openNodeBox();
      } else if (nodeBoxOpen === true) {
        $(".submit-1").click();
      }
    }

    if (e.keyCode === 27) {
      namegenerator.closeNodeBox();
    }

    // Prevent accidental backspace navigation
    if (e.keyCode === 8 && !$(e.target).is("input, textarea")) {
      e.preventDefault();
    }

  };

  var inputKeypressHandler = function(e) {
    if (nodeBoxOpen === true) {
      if (e.keyCode !== 13) {
        if($('#fname_t0').val().length > 0 && $('#fname_t0').val().length > 0) {

          var lname = $('#fname_t0').val()+" "+$('#lname_t0').val().charAt(0);
          if ($('#lname_t0').val().length > 0 ) {
            lname +=".";
          }

          var updateName = function() {
            $('#nname_t0').val(lname);
          };

          setTimeout(updateName,0);  
            
        }
      }      
    }

  };

  var cardClickHandler = function() {
    var index = $(this).data('index');
    var edge = network.getEdge(index);
    editing = index;
    $.each(namegenerator.options.variables, function(index, value) {
      if(value.private === false) {
          if (value.type === 'relationship') {
            $("select[name='"+value.variable+"']").val(edge[value.variable]);
          } else if (value.type === 'subrelationship') {
            $("select[name='reltype_sub_t0']").children().remove();
            $("select[name='reltype_sub_t0']").append('<option value="">Choose a specific relationship</option>');
      
            $.each(relationshipTypes[$("select[name='reltype_main_t0']").val()], function(index,value) {
              $("select[name='reltype_sub_t0']").append('<option value="'+value+'">'+value+'</option>');
            });

            $("select[name='"+value.variable+"']").val(edge[value.variable]);
            $("select[name='reltype_sub_t0']").prop( "disabled", false );
            
              if(edge.reltype_oth_t0 !== undefined && edge.reltype_oth_t0 !== "") {
                $('.reltype_oth_t0').val(edge.reltype_oth_t0);
                $('.reltype_oth_t0').show();
              }
          }else {
            $('#'+value.variable).val(edge[value.variable]);    
          }
        
        namegenerator.openNodeBox();
      }
      
    });
  };

  var cancelBtnHandler = function() {
    namegenerator.closeNodeBox();
  };

  namegenerator.openNodeBox = function() {
    // $('.newNodeBox').show();
    $('.newNodeBox').transition({scale:1,opacity:1},300);
    $("#ngForm input:text").first().focus();
    nodeBoxOpen = true;
  };

  namegenerator.closeNodeBox = function() {
    $('.newNodeBox').transition({scale:0.1,opacity:0},500);
    nodeBoxOpen = false;
    $('#ngForm').trigger("reset"); 
    $('.reltype_oth_t0').hide();
    editing = false;       
  };

  namegenerator.init = function() {

    // create elements
    var title = $('<h1 class="text-center"></h1>').html(namegenerator.options.heading);
    namegenerator.options.targetEl.append(title);
    var subtitle = $('<p class="lead"></p>').html(namegenerator.options.subheading);
    namegenerator.options.targetEl.append(subtitle);
    var alterCountBox = $('<div class="alter-count-box"></div>');
    namegenerator.options.targetEl.append(alterCountBox);


    // create node box
    var newNodeBox = $('<div class="newNodeBox"><form role="form" id="ngForm" class="form"><div class="col-sm-6 left"><h2 style="margin-top:0">Adding a Node</h2><ul><li>Try to be as accurate as you can, but don\'t worry if you aren\'t sure.</li><li>We are interested in your perceptions, so there are no right answers!</li><li>You can use the tab key to quickly move between the fields.</li><li>You can use the enter key to submit the form.</li></ul></div><div class="col-sm-6 right"></div></form></div>');
    namegenerator.options.targetEl.append(newNodeBox);
    $.each(namegenerator.options.variables, function(index, value) {
      if(value.private !== true) {
        
        var formItem, selectBox;

        switch(value.type) {
          case 'text':
            formItem = $('<div class="form-group '+value.variable+'"><label class="sr-only" for="'+value.variable+'">'+value.label+'</label><input type="text" class="form-control '+value.variable+'" id="'+value.variable+'" placeholder="'+value.label+'"></div></div>');
          break;

          case 'number':
            formItem = $('<div class="form-group '+value.variable+'"><label class="sr-only" for="'+value.variable+'">'+value.label+'</label><input type="number" class="form-control '+value.variable+'" id="'+value.variable+'" placeholder="'+value.label+'"></div></div>');
          break; 

          case 'relationship':
            selectBox = $('<select class="form-control" name="'+value.variable+'"><option value="">Choose a relationship category</option></select>');
            $.each(relationshipTypes, function(index){
                selectBox.append('<option value="'+index+'">'+index+'</option>');
            });
            formItem = $('<div class="form-group '+value.variable+'"></div></div>');
            formItem.append(selectBox);
          break;

          case 'subrelationship':
            selectBox = $('<select class="form-control" name="'+value.variable+'"><option value="">Choose a specific relationship</option></select>');
            $.each(relationshipTypes, function(index){
                selectBox.append('<option value="'+index+'">'+index+'</option>');
            });
            formItem = $('<div class="form-group '+value.variable+'"></div>');
            formItem.append(selectBox);
            
          break;

        }
        $('.newNodeBox .form .right').append(formItem);
        if (value.required === true) {
          if (value.type === 'relationship') {
            $("select[name='"+value.variable+"']").prop("required", true);            
          } else {
            $('#'+value.variable).prop("required", true);            
          }
          
        }
        
      }

    });
    $("select[name='reltype_sub_t0']").prop( "disabled", true );
    var buttons = $('<div class="col-sm-6 text-center"><button type="submit" class="btn btn-primary btn-block submit-1">Add</button></div><div class="col-sm-6"><span class="btn btn-danger btn-block cancel">Cancel</span></div>');
    $('.newNodeBox .form .right').append(buttons);
   

    // create namelist container
    var nameList = $('<div class="table nameList"></div>');
    namegenerator.options.targetEl.append(nameList);

    // Event listeners
    $(document).on("keydown", keyPressHandler);
    $('.cancel').on('click', cancelBtnHandler);
    $("#fname_t0, #lname_t0").keyup(inputKeypressHandler);
    $('.reltype_oth_t0').hide();
    $(document).on("click", ".card", cardClickHandler);


    $("select[name='reltype_main_t0']").change(function() {
      if ($("select[name='reltype_main_t0']").val() === "") {
        $("select[name='reltype_sub_t0']").prop( "disabled", true);
        return false;
      } 
      $("select[name='reltype_sub_t0']").prop( "disabled", false );
      $("select[name='reltype_sub_t0']").children().remove();
      $("select[name='reltype_sub_t0']").append('<option value="">Choose a specific relationship</option>');
      $.each(relationshipTypes[$("select[name='reltype_main_t0']").val()], function(index,value) {
        $("select[name='reltype_sub_t0']").append('<option value="'+value+'">'+value+'</option>');
      });
    });

    $("select[name='reltype_sub_t0']").change(function() {
      if ($("select[name='reltype_sub_t0']").val() === "Other") {
        $('.reltype_oth_t0').show();
      } else {
        $('.reltype_oth_t0').val("");
        $('.reltype_oth_t0').hide();
      }
    });    

    $('#ngForm').submit(function(e) {
      
    e.preventDefault();

      var newEdgeProperties = {};
      var newNodeProperties = {};

      $.each(namegenerator.options.variables, function(index,value) {

        if(value.target === 'edge') {
          if (value.private === true) {
            newEdgeProperties[value.variable] =  value.value;
          } else {
            if(value.type === 'relationship' || value.type === 'subrelationship') {
              newEdgeProperties[value.variable] =  $("select[name='"+value.variable+"']").val(); 
            } else {
              newEdgeProperties[value.variable] =  $('#'+value.variable).val();    
            } 
          }
          
        } else if (value.target === 'node') {
          if (value.private === true) {
            newNodeProperties[value.variable] =  value.value;
          } else {
            if(value.type === 'relationship' || value.type === 'subrelationship') {
              newNodeProperties[value.variable] =  $("select[name='"+value.variable+"']").val(); 
            } else {
              newNodeProperties[value.variable] =  $('#'+value.variable).val();    
            }
              
          }
        }
      });

      var nodeProperties = {};
      var edgeProperties = {};

      if (editing === false) {
        console.log('editing is false');
        extend(nodeProperties, newNodeProperties);
        var newNode = network.addNode(nodeProperties);

        edgeProperties = {
          from: network.getNodes({type_t0:'Ego'})[0].id,
          to: newNode,
        };

        extend(edgeProperties,newEdgeProperties);
        var id = network.addEdge(edgeProperties);
        var edge = network.getEdge(id);
        namegenerator.addToList(edge);
        alterCount++;
        $('.alter-count-box').html(alterCount);

      } else {
        
        var color = function() {
          var el = $('div[data-index='+editing+']');
          el.stop().transition({background:'rgba(51, 160, 117, 1)'}, 400, 'ease');
          setTimeout(function(){
            el.stop().transition({ background:'rgba(238,238,238, 1)'}, 800, 'ease');
          }, 1500);
        };
        
        console.log('editing is not false');        
        
        network.updateEdge(editing,newEdgeProperties, color);
        var nodeID = network.getEdge(editing).to;
        network.updateNode(nodeID, newNodeProperties);
        
        var properties = extend(newEdgeProperties,newNodeProperties);

        $('div[data-index='+editing+']').html("");
        $('div[data-index='+editing+']').append('<h4>'+properties.nname_t0+'</h4>');
        var list = $('<ul></ul>');

        $.each(namegenerator.options.variables, function(index, value) {
          if (value.private === false && properties[value.variable] !== undefined && properties[value.variable] !== "") {
          list.append('<li class="'+properties[value.variable]+'"><strong>'+value.label+'</strong>: '+properties[value.variable]+'</li>');      
          }
      
        });
        
        $('div[data-index='+editing+']').append(list);
        // var edge = network.getEdge(editing);;
        
        editing = false;
      }

      // $('#ngForm').trigger("reset");
      namegenerator.closeNodeBox();

    });

    // Set node count box
    $('.alter-count-box').html(alterCount);
  };

  namegenerator.addToList = function(properties) {
    // var index = $(this).data('index');
    var card;
    
    card = $('<div class="card" data-index="'+properties.id+'"><h4>'+properties.nname_t0+'</h4></div>');
    var list = $('<ul></ul>');
    $.each(namegenerator.options.variables, function(index, value) {
      if (value.private === false && properties[value.variable] !== undefined && properties[value.variable] !== "") {
      list.append('<li class="'+properties[value.variable]+'"><strong>'+value.label+'</strong>: '+properties[value.variable]+'</li>');      
      }
  
    });
    card.append(list);
    $('.nameList').append(card);

  };

  namegenerator.update = function(id) {
    var targetEdge = {};
      $.each(namegenerator.options.variables, function(index, value){
        if (value.private === true) {
          targetEdge[value.variable] = value.value;
        } else {
          targetEdge[value.variable] = $('div[data-index='+id+']').children('.'+value.variable).html();
        }
      });

      var color = function() {
        $('tr[data-index='+id+']').stop().transition({background:'rgba(51, 160, 117, 1)'}, 800, 'ease');
        setTimeout(function(){
          $('tr[data-index='+id+']').stop().transition({ background:'rgba(0,0,0,0)'}, 1800, 'ease');
        }, 1500);
        $("#ngForm input:text").first().focus();
      };
      network.updateEdge(id, targetEdge, color);
  };

  // namegenerator.remove = function() {

  // };


  namegenerator.init();

  return namegenerator;
};