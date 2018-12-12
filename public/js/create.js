$(function() {
   console.log( "document ready!" );

   //Changes Displayed difficulty value
   $("#rDiff").mousemove(function () {
      $("#text").text($("#rDiff").val())
  });

  $('#newIng').click(function() {

   const newRow = `<div class="row">
                  <input class="col-md-3 offset-1 form-control" name="ingredients" style="margin: 1%;" type="text" placeholder="ingredient">
                  </div>`;

     $(".newIngredient").append(newRow);
   });

});