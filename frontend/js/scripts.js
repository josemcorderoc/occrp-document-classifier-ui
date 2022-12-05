/*!
* Start Bootstrap - Landing Page v6.0.5 (https://startbootstrap.com/theme/landing-page)
* Copyright 2013-2022 Start Bootstrap
* Licensed under MIT (https://github.com/StartBootstrap/startbootstrap-landing-page/blob/master/LICENSE)
*/

$(document).ready(function(){
    
    let statsJSONInput = 
    `{
        "page-1": [
          {
            "class-1": "0.9",
            "class-2": "0.1",
            "class-3": "0.2",
            "class-4": "0.0",
            "class-5": "0.3",
            "class-6": "0.2",
            "class-7": "0.1",
            "class-8": "0.0",
            "class-9": "0.2"
          }
        ],
        "page-2": [
          {
            "class-1": "0.3",
            "class-2": "0.2",
            "class-3": "0.1",
            "class-4": "0.0",
            "class-5": "0.5",
            "class-6": "0.7",
            "class-7": "0.5",
            "class-8": "0.2",
            "class-9": "0.1"
          }
        ],
        "page-3": [
          {
            "class-1": "0.2",
            "class-2": "0.3",
            "class-3": "0.2",
            "class-4": "0.1",
            "class-5": "0.4",
            "class-6": "0.6",
            "class-7": "0.9",
            "class-8": "0.2",
            "class-9": "0.3"
          }
        ]
      }`
    
    const stats = JSON.parse(statsJSONInput);


    $("#showbutton").click(function(){

        
        for (const [pagekey, pagevalue] of Object.entries(stats)) {
            
            let clone = $("#results-template").clone()

            // clone.removeAttr('id');
            clone.show();
            
            // set ids
            clone.attr('id', pagekey)
            $(".results-graph-pseudo", clone).attr('id', pagekey + '-graph')
            
            $(".order-lg-1 > h2", clone).text(pagekey);

            clone.appendTo("#result-section");

            let someresults = "";
            var someresultsArray = ["0.3", "0.7"];
            for (const [classkey, classvalue] of Object.entries(pagevalue[0])) {
                
                someresults = someresults + " " + classvalue;
                someresultsArray.push(parseFloat(classvalue));
            }

            // $(".order-lg-2 > .results-graph-pseudo", clone).text(someresults);


            var data = [
              {
              x: [
                  'bank statement',
                  'company registry',
                  'contract',
                  'court document',
                  'gazette',
                  'invoice',
                  'passport',
                  'receipt',
                  'other'
              ],
              y: someresultsArray,
              type: 'bar'
              }
            ];
        
            Plotly.newPlot(pagekey + '-graph', data);
            
            // prediction
            //$(".order-lg-2 > .results-prediction-pseudo", clone).text("Bank statement");

        }
  

    });


    $("#hidebutton").click(function(){

        
      for (const [pagekey, pagevalue] of Object.entries(stats)) {
          
          let clone = $("#results-template").clone()

          clone.removeAttr('id');
          clone.show();
          

          $(".order-lg-1 > h2", clone).text(pagekey);

          clone.appendTo("#result-section");

          let someresults = "";
          for (const [classkey, classvalue] of Object.entries(pagevalue[0])) {
              
              someresults = someresults + " " + classvalue;
          }
          
          console.log(someresults);

          $(".order-lg-2 > .results-pseudo-class", clone).text(someresults);

      }


  });

});

