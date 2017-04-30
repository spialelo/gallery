 /* Version 1.4.0 */

 (function() {

     var imgContainer = document.querySelector('.img-container');
     var shownImg = document.querySelector('.activeImg');
     var lightbox = document.querySelector('.lightbox-modal');
     var goBack = document.querySelector('.slidePrev');
     var goForward = document.querySelector('.slideNext');
     var closeModal = document.querySelector('.close-modal');
     var captionImg = document.querySelector('.activeImg-title');
     var inputArea = document.querySelector('.input-area');
     var loadMessage = document.querySelector('.load-message');

     /* Prepopulating the search query. */
     window.addEventListener('load', function() {

         var requestData = new XMLHttpRequest();

         requestData.onreadystatechange = function() {

             if (requestData.readyState == 4) {

                 if (requestData.status == 200 || requestData.status == 304) {

                     var data = JSON.parse(requestData.responseText);
                     var dataPhotos = data.photos.photo;

                     console.log('starting stream...');

                     dataPhotos.forEach(displayPhotos);

                 } else if (requestData.status == 0) {
                     console.log('The Flickr API returned error code #0: Sorry, the Flickr API service is not currently available.');
                 } else {
                     console.log('success, but error' + requestData.status + requestData.readystate);
                 }

             }

         };


         requestData.onerror = function() {
             /* There was a connection error of some sort. */
             console.log('big error: ' + requestData.status);
         };


         var countTimeout = 0;


         (function xmlHTTPRequestTimeout() {
             if (countTimeout < 5) {
                 inputArea.style.display = 'none';
                 loadMessage.classList.add('open');
                 setTimeout(
                     function() {
                         requestData.open(
                             "GET",
                             "https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=1d34d38ac77079c5daa12628d132bee3&tags=pumpkin+pie&format=json&privacy_filter=1&safe_search=2&content_type=1&extras=description&nojsoncallback=1",
                             true
                         );
                         requestData.send();
                         console.log(countTimeout);
                         countTimeout++;
                         xmlHTTPRequestTimeout();
                     }, 2000);
             } else {
                 resetFields();
                 clearTimeout(xmlHTTPRequestTimeout);

             }
         })();

     });


     /* Check if our search was run and have results present already. */
     function checkIfRan() {
         if (imgContainer.children.length > 0) {
             while (imgContainer.firstChild) {
                 imgContainer.removeChild(imgContainer.firstChild);
             }
         }

     }


     function resetFields() {
         inputArea.style.display = 'block';
         loadMessage.classList.remove('open');
         document.querySelector('.input-field').value = '';
     }


     /* On form submit, call the function to generate the results. */
     document.querySelector('.search-form').addEventListener('submit', function(e) {
         e.preventDefault();
         createSearchResults();
     });


     /* Assemble the li and img elements, then append to the ul.*/
     function displayPhotos(flickrImg, index, collectionOfPhotos) {
         var listItem = document.createElement("li");
         listItem.setAttribute("class", "");
         var retrievedImg = document.createElement("img");
         var imgURLPath = "http://farm" + collectionOfPhotos[index].farm + ".static.flickr.com/" + collectionOfPhotos[index].server + "/" + collectionOfPhotos[index].id + "_" + collectionOfPhotos[index].secret + "_m.jpg";
         var retrievedTitle = collectionOfPhotos[index].title;
         retrievedImg.setAttribute("src", imgURLPath);
         retrievedImg.setAttribute("title", retrievedTitle);
         retrievedImg.setAttribute("alt", retrievedTitle);
         listItem.appendChild(retrievedImg);
         imgContainer.appendChild(listItem);
         showCasePhotos();
     }


     /* Checks if there are any li elements with the active class and removes it. */
     function checkActive() {
         var activeClassImgs = document.querySelectorAll('.active');
         if (activeClassImgs.length > 0) {
             document.querySelector('.active').classList.remove('active');
         }
     }


     /* Want to make caption init cap. */
     String.prototype.initCap = function() {
         return this.toLowerCase().replace(/(?:^|\s)[a-z]/g, function(m) {
             return m.toUpperCase();
         });
     };


     /* Gets all of the li > img and add an event Listener to see if it was clicked. Fires the modal and shows the appropriate image. */
     function showCasePhotos() {
         var thumbnailImgs = document.querySelectorAll('li');
         var currentImage;
         var currentImageTitle;
         var indexImage;

         if (thumbnailImgs.length > 0) {
             /* Because IE had to be IE. Called forEach this way instead of on the NodeList. */
             Array.prototype.forEach.call(thumbnailImgs, function(thumbnailItem) {
                 thumbnailItem.addEventListener('click', function() {

                     /* Display lightbox div and add class of open to it. */
                     lightbox.classList.add('open');

                     checkActive();
                     this.setAttribute('class', 'active');
                     currentImage = this.children[0].getAttribute('src');

                     if (this.children[0].getAttribute('title') != '') {
                         currentImageTitle = this.children[0].getAttribute('title');

                     } else {
                         currentImageTitle = 'No title provided.';
                     }

                     shownImg.setAttribute('src', currentImage);
                     captionImg.textContent = currentImageTitle.initCap();

                     var child = this;
                     var parent = this.parentNode;
                     indexImage = Array.prototype.indexOf.call(parent.children, child);

                 });
             });

         }

         /* Update the image show in lightbox modal, it's caption, and add class active to the li. */
         function updateImageOnArrow(n) {
             thumbnailImgs[n].setAttribute('class', 'active');
             shownImg.setAttribute('src', thumbnailImgs[n].children[0].getAttribute('src'));
             captionImg.textContent = thumbnailImgs[n].children[0].getAttribute('title');
         }

         /* Updates the image shown when user goes left. */
         function goLeft() {
             checkActive();
             if (indexImage < 1) {
                 indexImage = 0;
                 updateImageOnArrow(indexImage);
             } else {
                 indexImage = indexImage - 1;
                 updateImageOnArrow(indexImage);
             }
         }

         /* Updates the image shown when user goes right. */
         function goRight() {
             checkActive();

             if (indexImage > thumbnailImgs.length - 2) {
                 indexImage = thumbnailImgs.length - 1;
                 updateImageOnArrow(indexImage);

             } else {
                 indexImage = indexImage + 1;
                 updateImageOnArrow(indexImage);
             }

         }

         /* On click of the goBack div, navigate to image to the left. */
         goBack.addEventListener('click', function() {
             goLeft();
         });

         /* On click of the goForward div, navigate to image to the right. */
         goForward.addEventListener('click', function() {
             goRight();
         });

         /* If 'x' clicked, hide it. */
         closeModal.addEventListener('click', function() {
             document.querySelector('.open').classList.remove('open');
         });


         /* If lightbox modal is open, user can use keyboard to navigate through images also. Hitting 'esc' closes modal. */
         document.body.onkeydown = function(e) {
             if (document.querySelectorAll('.open').length > 0) {
                 switch (e.keyCode) {
                     case 37:
                         e.preventDefault();
                         goLeft();
                         break;
                     case 39:
                         e.preventDefault();
                         goRight();
                         break;
                     case 27:
                         document.querySelector('.open').classList.remove('open');
                         break;
                     default:
                         break;
                 }
             }
         };

     }


     /* When user creates there own search query to Flickr. */
     function createSearchResults() {

         checkIfRan();

         var inputReceived = document.querySelector('.input-field').value;
         var finalQuery = inputReceived.replace(/ /g, '+');
         var pageNum = 1;
         var urlToGet = "https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=1d34d38ac77079c5daa12628d132bee3&tags=" + finalQuery + "&format=json&privacy_filter=1&safe_search=2&content_type=1&extras=description&nojsoncallback=1";

         inputArea.style.display = 'none';
         loadMessage.classList.add('open');

         var requestData = new XMLHttpRequest();

         requestData.onreadystatechange = function() {

             if (requestData.readyState == 4) {

                 if (requestData.status == 200 || requestData.status == 304) {

                     var data = JSON.parse(requestData.responseText);
                     var dataPhotos = data.photos.photo;

                     console.log('starting stream...');

                     var count = 0;
                     var max = 10;
                     //console.log(data);


                     dataPhotos.forEach(displayPhotos);

                 } else if (requestData.status == 0) {
                     console.log('The Flickr API returned error code #0: Sorry, the Flickr API service is not currently available.');
                 } else {
                     console.log('success, but error' + requestData.status + requestData.readystate);
                 }

             }

         };

         requestData.onerror = function() {
             // There was a connection error of some sort
             console.log('big error: ' + requestData.status);
         };


         var countTimeout = 0;


         (function xmlHTTPRequestTimeout() {
             if (countTimeout < 5) {
                 inputArea.style.display = 'none';
                 loadMessage.classList.add('open');
                 setTimeout(
                     function() {
                         requestData.open(
                             "GET",
                             urlToGet,
                             true
                         );
                         requestData.send();
                         console.log(countTimeout);
                         countTimeout++;
                         xmlHTTPRequestTimeout();
                     }, 2000);
             } else {
                 resetFields();
                 clearTimeout(xmlHTTPRequestTimeout);

             }
         })();

     }

 })();