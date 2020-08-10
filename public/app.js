function main() {
  // Grab the articles as a json
  $.getJSON("/articles", function (data) {
    //clear the card body first.
    $("#articles").empty();

    if(data.length === 0 || !data) {
      $("#articles").append(
        `<p>
          No articles were found! <br />
          <a href="#" class="btn btn-secondary scrape-new">Scrape for New Articles</a>
        </p>`
      )
    } else {
      // For each one append a card
      for (var i = 0; i < data.length; i++) {
        // Display the apropos information on the page
        var card = `<div class="card border-primary mb-3" >
                      <div class="card-header">
                        <a data-id="${data[i]._id}" href="${data[i].link}" target="_blank"><h4>${data[i].title}</h4></a>
                      </div>
                      <div class="card-body">
                        <p class="card-text">${data[i].teaser}</p>
                        <button data-id="${data[i]._id}" type="button" class="btn btn-sm btn-outline-primary btn-note">Notes</button>
                        <hr />
                        <p class="note-text">
                          ${data[i].note ? data[i].note.body : ""}
                        </p>
                      </div>
                    </div>`
        
        $("#articles").append(card);
      }

    }
    
  });
}


// Whenever someone clicks a h2 tag
$(document).on("click", "h2", function () {
  // Empty the notes from the note section
  $("#notes").empty();
  // Save the id from the h2 tag
  var thisId = $(this).attr("data-id");

  // Now make an ajax call for the Article
  $.ajax({
    method: "GET",
    url: "/articles/" + thisId
  })
    // With that done, add the note information to the page
    .then(function (data) {
      console.log(data);
      // The title of the article
      $("#notes").append("<h2>" + data.title + "</h2>");
      // An input to enter a new title
      $("#notes").append("<input id='titleinput' name='title' >");
      // A textarea to add a new note body
      $("#notes").append("<textarea id='bodyinput' name='body'></textarea>");
      // A button to submit a new note, with the id of the article saved to it
      $("#notes").append("<button data-id='" + data._id + "' id='savenote'>Save Note</button>");

      // If there's a note in the article
      if (data.note) {
        // Place the title of the note in the title input
        $("#titleinput").val(data.note.title);
        // Place the body of the note in the body textarea
        $("#bodyinput").val(data.note.body);
      }
    });
});

// When you click the savenote button
$(document).on("click", "#savenote", function () {
  // Grab the id associated with the article from the submit button
  var thisId = $(this).attr("data-id");

  // Run a POST request to change the note, using what's entered in the inputs
  $.ajax({
    method: "POST",
    url: "/articles/" + thisId,
    data: {
      // Value taken from title input
      title: $("#titleinput").val(),
      // Value taken from note textarea
      body: $("#bodyinput").val()
    }
  })
    // With that done
    .then(function (data) {
      // Log the response
      console.log(data);
      // Empty the notes section
      $("#notes").empty();
    });

  // Also, remove the values entered in the input and textarea for note entry
  $("#titleinput").val("");
  $("#bodyinput").val("");
});

// Click functions for clear and scrape 

$(document).on("click", "#clear", function () {
  
  $.ajax({
    method: "GET",
    url: "/articles/clear"
  })
  .then(function(data){
    $("#articles").empty();
    $("#articles").append(
      `<p>
        No articles were found! <br />
        <a href="#" class="btn btn-secondary scrape-new">Scrape for New Articles</a>
      </p>`
    )
  })
});

$(document).on("click", ".scrape-new", function () {
  $.get("/scrape", function (data) {
    main();
  })
});

$(document).on("click", ".btn-note", function(){
  $.ajax({
    method: "GET",
    url: `/articles/${$(this).attr("data-id")}`

  })
  .then(function(data){
    $("#note-body").empty();
    $("#note-body").val(data.note ? data.note.body : "");
  });
  $("#note-body").attr("data-id", $(this).attr("data-id"));
  $("#note").modal('toggle');
});

$(document).on("click", "#save-notes", function(){
  $('#note').modal('hide');
  var noteText = $("#note-body").val();
  var id = $("#note-body").attr('data-id');
  $.ajax({
    url: `/articles/${id}`,
    method: "POST",
    data: {
      title: $('#note-title').val(),
      body: $('#note-body').val()
    }
  })
  .then(function(){
    main();
  })
});

//run the main function to start everything
main();