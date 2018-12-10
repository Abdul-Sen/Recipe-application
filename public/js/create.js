$(function() {
   console.log( "document ready!" );

   //Changes Displayed difficulty value
   $("#rDiff").mousemove(function () {
      $("#text").text($("#rDiff").val())
  });
});