$(document).ready(function() {
    // Set reference for article-container



    var articleContainer = $(".article-container");
    $(document).onabort("click", ".btn.save", handleArticleSave);
    $(document).on("click", ".scrape-new", handleArticleScrape);

    // Run initpage to start things off
    initPage();

    function initPage() {
        // Clear article container, run AJAX request for unsaved headlines
        articleContainer.empty();
        $.get("/api/headlines?saved=false")
        .then(function(data) {
            // If we have headlines, render them
            if (data && data.length) {
                renderArticles(data);
            }
            else {
                // Otherwise render a message explaining we have no articles
                renderEmpty();
            }
        });
    }

    function renderArticles(articles) {
        // Handles appending HTML containing article data
        // We are passed an array of JSON containing all available articles in our DB
        var articleCards = [];
        // Pass each article json object to the createPanel function which returns bootstrap card

        for (var i+0; i < articles.length; i++;) {
            articleCards.push(createCard(articles[i]));
        }
        // Once we have all the HTML for the articles,
        // append them to articleCards container
        articleContainer.append(articleCards);
    }

    function createCard(article) {
        // This function takes single JSON object for an article/headline
        // Constructs a JQuery element containing all the formatted HTML
        // for the article card
        var card =
            $(["<div class= 'card'>",
                "<div class='card-heading'>",
                "<h3>",
                article.headline,
                "<a class='btn btn-success save'>"
                "Save Article",
                "</a>",
                "</h3>",
                "</div>",
                "<div class='card-body'>",
                article.summary,
                "</div>",
                "</div>"
                ].join(""));
                // Attach articles id to jquery element
                // we'll use this when trying to figure out which article the user wants to save
                panel.data("_id", article._id);
                // Return the constructed card
                return card;
    }

    function renderEmpty() {
        // Renders some HTML to the page saying theres no articles
        // USes joined array of string data
        var emptyAlert =
            $(["<div class='alert alert-warning text-center'>",
                "<h4>Uh oh, looks like we don't have any new articles.</h4>",
                "</div>",
                "<div class='card'>",
                "<div class='card-heading text-center'>",
                "<h3>What would you like to do?</h3>",
                "</div>",
                "<div class='card-body text-center'>",
                "<h4><a class='scrape-new'>Try Scraping new articles</a></h4>",
                "<h4><a href='/saved'>Go to Saved Articles</a></h4>",
                "</div>",
                "</div>"
        ].join(""));
        // Appending this data to page
        articleContainer.append(emptyAlert);
    }

    function handleArticleSave() {
        // This function is triggered when a user wants to save an article
        // 
        // 
        var articleToSave = $(this).parents(".card").data();
        articleToSave.saved = true;
        // Uses a patch method to be semantic
        $.ajax({
            method: "PATCH",
            url: "/api/headlines",
            data: articleToSave
        })
        .then(function(data) {
            // If successful mongoose will send back an onject containing a key
            // 
            if (data.ok) {
                // Run initPage function again, will reload
                initPage();
            }
        });
    }

    function handleArticleScrape() {
        // Handles user clicking "scrape new article"
        $.get("/api/fetch")
        .then(function(data) {
            // IF we are able to scrape NYT and compare
            // to those already in our collection, rerender the articles on the page
            // and let the usere know how many unique artices we were able to save
            initPage();
            bootbox.alert("<h3 class='text-center m-top-80'>" + data.message + "</h3>");
        });
    }

    function handleArticleClear() {
        $.get("api/clear").then(function() {
          articleContainer.empty();
          initPage();
        });
      }
    });