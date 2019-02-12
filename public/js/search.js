$(function() {
function getRecpies(queryString)
{
    $.ajax({
        url: "https://www.themealdb.com/api/json/v1/1/search.php?s=" + queryString,
        type: "GET",
        contentType: "application/json"
    })
    .done(function (data) {
        console.log(data); // output all employees to the console
    })
    .fail(function (err) {
        console.log("error: " + err.statusText);
    });

}
    console.log( "ready!" );
    $("#recpie-search").keyup(function () {
        console.log((this).value);
        getRecpies((this).value);
    });

});


