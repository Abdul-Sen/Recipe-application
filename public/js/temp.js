 $( function() {
    $( "#slider-range-max" ).slider({
      range: "max",
      min: 1,
      max: 5,
      value: 2,
      slide: function( event, ui ) {
        $( "#amount" ).val( ui.value );
      }
    });
    
    $("#amount" ).val( $( "#slider-range-max" ).slider( "value" ) );
    console.log( "document ready!" );
  } );