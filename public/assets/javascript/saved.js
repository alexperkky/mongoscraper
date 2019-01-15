// Global bootbox
$(document).ready(function(){
    // Getting a reference to article container div
    var articleContainer = $(".article-container");
    // Add event listeners for generated buttons, deleting
    // Pulling up, and saving article notes
    $(document).on("click", ".btn.delete", handleArticleDelete);
    $(document).on("click", ".btn.notes", handleArticleNotes);
    $(document).on("click", ".btn.save", handleNoteSave);
    $(document).on("click", ".btn.note-delete", handleNoteDelete);

    // initPage kicks everything off when page is loaded
    initPage();

    function initPage() {
        // Empty article container, run AJAX req for saved headlines
        articleContainer.empty();
        $.get("/api/headlines?saved=true").then(function(data){
            // If we have headlines, render them
            if (data && data.length) {
                renderArticles(data);
            } else {
                // Otherwise render message saying no articles
                renderEmpty();
            }
        });
    }

    function renderArticles(articles) {


        var articleCards = [];


        for (var i=0; i < articles.length, i++) {
            articleCards.push(createCard(articles[i]));
        }


        articleContainer.append(articleCards);
    }

    function createCard(article) {



        var card =
        $(["<div class='card'>",
            "<div class='card-heading'>",
            "<h3>",
            article.headline,
            "<a class='btn btn-danger delete'>",
            "Delete from Saved",
            "</a>",
            "<a class='btn btn-info notes'>Article Notes</a>",
            "</h3>",
            "</div>",
            "div class='card-body'>",
            article.summary,
            "</div>",
            "</div>"
        ].join(""));
        // Attach articles id to JQuery element
        // We will use this when trying to figure out which article the user wants to remove notes for
        card.data("_id", article._id);
        // REturn constructed card
        return card;
    }

    function renderEmpty() {


        var emptyAlert =
        $(["<div class='alert alert-warning text-center'>",
            "<h4>Uh oh, looks like we don't have any saved articles.</h4>",
            "</div>",
            "<div class='card>",
            "<div class='card-heading text-center'>",
            "<h3>Would you like to browse available articles?</h3>",
            "</div>",
            "<div class='card-body text-center'>",
            "<h4><a href='/'>Browse Articles</a></h4>",
            "</div>",
            "</div>"
        ].join(""));
        // Appending data to page
        articleContainer.append(emptyAlert);
    }

    function renderNotesList(data) {



        var notesToRender = [];
        var currentNote;
        if (!data.notes.length) {
            // If we have no notes just dispay a message
            currentNote = [
                "<li class='list-grou-item'>",
                "No notes for this article yet.",
                "</li>"
            ].join("");
            notesToRender.push(currentNote);
        }
        else {
            // If we do have notes, go through each one
            for (var i=0; i <data.notes.length; i++) {
                // Constructs a li element to contain our noteText and a delete button
                currentNote = $([
                    "<li class ='list-group-item note'>",
                    data.notes[i].noteText,
                    "<button class='btn btn-danger note-delete'>x</button>",
                    "</li>"
                ].join(""));
                // Store note id on the delete button
                currentNote.children("button").data("_id", data.notes[i]._id);
                // Adding currentNote to the notesToRender array
                notesToRender.push(currentNote);
            }
        }
        // Now append the notesToRender to the note-container inside note modal
        $(".note-container").append(notesToRender);
    }

    function handleArticleDelete() {


        var articleToDelete = $(this).parents(".card").data();
        // Use a delete method
        $.ajax({
            method: "DELETE",
            url: "/api/headlines/" + articleToDelete._id
        }).then(function(data) {

            if(data.ok) {
                initPage();
            }
        });
    }

    function handleArticleNotes() {


        var currentArticle = $(this).parents(".card").data();
        // Grab any notes with headline/article id
        $.get("/api/notes" + currentArticle._id).then(function(data) {

            var modalText = [
                "<div class='container-fluid text-center'>",
                "<h4>Notes For Article: ",
                currentArticle._id,
                "</h4>",
                "<hr />",
                "<ul class='ist-group note container'>",
                "</ul>",
                "<textarea placeholder='New Note' rows='4' cols='60'></textarea>",
                "<button class='btn btn-success save'><Save Note</button>",
                "</div>"
            ].join("");

            bootbox.dialog({
                message: modalText,
                closeButton: true
            });
            var noteData = {
                _id: currentArticle._id,
                notes: data || []
            };


            $(".btn.save").data("article", noteData);

            renderNotesList(noteData);
        });
    }

    function handleNoteSave() {



        var noteData;
        var newNote = $(".bootbox-body textarea").val().trim();


        if (newNote) {
            noteData = {
                _id: $(this).data("article")._id,
                noteText: newNote
            };
            $.post("/api/notes", noteData).then(function() {

                bootbox.hideAll();
            });
        }
    }

    function handleNoteDelete() {
        var noteToDelete = $(this).data("_id");

        $.ajax([
            url: "/api/notes/" + noteToDelete,
            method: "DELETE"
        ]).then(function() {
            bootbox.hideAll();
        });
    }
});