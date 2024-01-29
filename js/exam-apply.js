
$(function () {
  // preload media function
  function preloadMedia(mediaList, onDone, onFailed) {
    let isPreloaded = true
    // get stack timeout
    const stackTimeout = $('span#apply-exam').attr('data-timeout') || 60
    // initiate
    if (!preloadMedia.list) {
      preloadMedia.list = []
    }
    let list = preloadMedia.list
    // preload the media
    for (let i = 0; i < mediaList.length; i++) {
      let media = undefined
      if (mediaList[i].media == 'image') {
        media = new Image()
        media.onload = function () {onLoadMediaHandle(this)}
      } else {
        media = new Audio()
        media.addEventListener('loadeddata', function (e) {onLoadMediaHandle(e.currentTarget)})
      }
      list.push(media)
      media.src = mediaList[i].url
    }
    // stack timeout listener
    let stackTimeoutListener = undefined
    // on load media handle
    let onLoadMediaHandle = function (currentMedia) {
      // reset interval
      if (stackTimeoutListener != undefined) {
        clearInterval(stackTimeoutListener)
      }
      // is preload fine
      if (isPreloaded) {
        // listen stack timeout
        stackTimeoutListener = setInterval(
          function () {
            isPreloaded = false
            clearInterval(stackTimeoutListener)
            onFailed()
          },
          stackTimeout * 1000
        )
      }
      // find index
      let index = list.indexOf(currentMedia)
      if (index !== -1) {
        list.splice(index, 1)
        // update progress
        let progress = Math.round(((mediaList.length - list.length) / mediaList.length) * 100)
        $('#progress').text(progress)
        // handle if all media loaded
        if (list.length == 0) {
          clearInterval(stackTimeoutListener)
          // all media loaded
          if (isPreloaded) {
            onDone()
          }
        } // list.length
      } // index !== -1
    } // onLoadMediaHandle
  } // preloadMedia
  // error handle
  let errorHandle = function () {
    $('#apply-process').addClass('d-none').removeClass('d-flex')
    $('#apply-button').removeClass('d-none').addClass('d-flex')
    $('#apply-exam').addClass('d-none')
    $('#apply-button').append('<span class="text-muted" style="padding: .4rem">Terjadi kesalahan, silahkan kembali.</span>')
  }
  // on apply
  $(document).on('click', 'span#apply-exam', function () {
    // loader
    $('#apply-button').addClass('d-none').removeClass('d-flex')
    $('#apply-process').removeClass('d-none').addClass('d-flex')
    // apply exam
    const applyUrl = $(this).attr('data-apply')
    const fetchConfig = {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    }
    fetch(applyUrl, fetchConfig).then(response => {
      // if response ok
      if (response.ok && response.status == 200) {
        // return the json data
        return response.json()
      }
      // otherwise throw an error
      throw new Error('Something went wrong')
    }).then(json => {
      // if success resposne
      if (json.status == 'success') {
        preloadMedia(
          json.data.media,
          function () {window.location.replace(json.data.redirect)},
          errorHandle
        )
      } else {
        // otherwise throw an error
        throw new Error(json.message)
      }
    }).catch(error => {
      // error handle
      errorHandle()
    });
  })
})