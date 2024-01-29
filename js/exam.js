$(function(){
  // prevent default
  $(document).keydown(function (e) {
    e.preventDefault()
  })
  $(document).on('contextmenu', function () {
    return false
  })
  // prevent default

  // get synch interval
  const synchInterval = $('#exam-container').attr('data-interval') || 30
  // get synchronize url
  const synchUrl = $('#exam-container').attr('data-synchronize')
  // synch process
  const synchProcess = setInterval(doSynch, synchInterval * 1000)
  // synch function
  function doSynch() {
    // validate url
    if (synchUrl == undefined) {
      // stop synchronize
      clearInterval(synchProcess)
    } else {
      // do synchronize
      const fetchConfig = {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      }
      // fetch synch
      fetch(synchUrl, fetchConfig).then(response => {
        // if response ok
        if (response.ok) {
          // validate status code
          if (response.status == 200) {
            // return the json data
            return response.json()
          }
          // otherwise throw an error
          throw new Error('Something went wrong')
        } else {
          // if unauthorized
          if (response.status == 401) {
            // reload the page
            clearInterval(synchProcess)
            location.reload()
          } else {
            // otherwise throw an error
            throw new Error(`Failed to fetch data. Status: ${response.status}`)
          }
        }
      }).then(json => {
        // if inactive student
        if (json.data.code == 'inactive') {
          // reload the page
          clearInterval(synchProcess)
          location.reload()
        }
      }).catch(error => {
        // stop the synch
        clearInterval(synchProcess)
      });
    }
  }
  // synch

  // customize image from summernote
  $('#question-numbers img[src^="data:image"]').each(function () {
    $(this).removeAttr('style').addClass('img-thumbnail').wrap('<div class="col-12 col-md-8 mx-auto"></div>')
  })

  $('#question-numbers br').remove()
  // customize image from summernote

  let isNavEnabled = true;
  let questionNumber = $('#question-numbers')
  let questionContainer = $('#question-container')
  let display = $('#timer')
  let duration = display.attr('data-duration') || 7200
  let timer = new CountDownTimer(duration)
  let timeoutSound = new Howl({
    src: 'https://cdn.jsdelivr.net/gh/arispati/ubt-asset@main/mp3/timeout.mp3'
  })

  // timer handle
  function tickHandle({hours, minutes, seconds}) {
    display.text(hours + ':' + minutes + ':' + seconds)
    
    if (this.running == false) {
      submitTheForm(true)
    } else {
      // play sound if there are 30 seconds remaining
      if (hours == 0 && minutes == 0 && seconds <= 30) {
        timeoutSound.play()
      }
    }
  }

  // run the timer
  timer.onTick(tickHandle).start()

  // submit the exam form
  function submitTheForm(bySystem = false) {
    // move to all question tab
    switchToTab('all')
    // disabled navigation
    isNavEnabled = false;
    // enabled layer
    $('#exam-body-layer').removeClass('d-none')
    // show submit loading
    $('#submit-container')
    .html('<span class="btn btn-primary">Submitting... <div class="spinner-border spinner-border-sm" role="status"><span class="sr-only">Loading...</span></div></span>')
    // form element
    let form = $('#exam-form')
    // if submitted by system
    if (bySystem) {
      let updatedBy = document.createElement('input')
      updatedBy.type = 'hidden'
      updatedBy.name = 'updated_by'
      updatedBy.value = 'system'
      // submit form with updated_by input
      form.append(updatedBy).submit()
    } else {
      // otherwise
      form.submit()
    }
  }

  // toggle question
  function toggleQuestion(number) {
    if (isNavEnabled) {
      let questionElm = $(`.question-number[data-number="${number}"]`)

      questionContainer.toggleClass('d-none')
      questionElm.toggleClass('d-none')
      questionNumber.toggleClass('d-none')
      $('.btn-tab-switch').attr('data-current', number)
    }
  }

  // question navigation
  function navQuestion(current, navigateTo) {
    if (isNavEnabled) {
      let elmCurrent = $(`.question-number[data-number="${current}"]`)
      let elmNavigateTo = $(`.question-number[data-number="${navigateTo}"]`)
      
      elmCurrent.toggleClass('d-none')
      elmNavigateTo.toggleClass('d-none')
      $('.btn-tab-switch').attr('data-current', navigateTo)
    }
  }

  // question button
  $(document).on('click', '.btn-question', function (e) {
    if (isNavEnabled) {
      toggleQuestion($(this).attr('data-number'))
    }
  })

  // question navigation
  $(document).on('click', '.navigation-question', function (e) {
    if (isNavEnabled) {
      navQuestion($(this).attr('data-current'), $(this).attr('data-navto'))
    }
  })

  // back to table question
  $(document).on('click', '.back-to-table', function (e) {
    if (isNavEnabled) {
      let activeTab = $('.btn-tab-switch.active').attr('data-tab')
      toggleQuestion($(this).attr('data-number'))
      toggleTab(activeTab)
      $('.btn-tab-switch').removeAttr('data-current')
    }
  })

  // when answer changed
  $(document).on('change', 'input.i-answer', function (e) {
    let number = $(this).attr('data-number')
    let button = $(`.btn-question[data-number="${number}"]`)
    let buttonContainer = $(`.btn-question-container[data-number="${number}"]`)
    
    button.removeClass('btn-outline-success')
      .addClass('btn-outline-primary')
      .addClass('active')
    buttonContainer.attr('data-answer', 1)
  })

  // question counter
  function questionCounter(category) {
    let count = $(`#tq-table-${category} .btn-question-container:not(.d-none)`).length
    let label = count > 1 ? 'Questions' : 'Question'

    return `${count} ${label}`
  }

  // tab toggle
  function toggleTab(tab) {
    if (isNavEnabled) {
      switch (tab) {
        case 'all':
          $('.btn-question-container').removeClass('d-none')
          break;
        case 'answered':
          $('.btn-question-container[data-answer="1"]').removeClass('d-none')
          $('.btn-question-container[data-answer="0"]').addClass('d-none')
          break;
        case 'ignored':
          $('.btn-question-container[data-answer="0"]').removeClass('d-none')
          $('.btn-question-container[data-answer="1"]').addClass('d-none')
          break;
      }

      $('.tq-counter').each(function () {
        $(this).html(questionCounter($(this).attr('data-category')))
      })
    }
  }
  // switch to tab name
  function switchToTab(tabName) {
    if (isNavEnabled) {
      $('.btn-tab-switch').removeClass('active')
      $(`.btn-tab-switch[data-tab="${tabName}"]`).addClass('active')
      let activeQuestion = $('.btn-tab-switch').attr('data-current')
      toggleTab(tabName)
      if (activeQuestion != undefined) {
        toggleQuestion(activeQuestion)
        $('.btn-tab-switch').removeAttr('data-current')
      }
    }
  }

  // tab toggle
  $(document).on('click', '.btn-tab-switch', function (e) {
    switchToTab($(this).attr('data-tab'))
  })

  // play audio
  $(document).on('click', '#exam-body:not(.playing) span[data-audio="playable"]', function (e) {
    let elm = $(this)
    let icon = $(this).find('i')
    let audio = $(this).attr('data-content')
    let sound = new Howl({
      src: [audio],
      onplay: function () {
        isNavEnabled = false
        $('#exam-body').addClass('playing')
        elm.attr('data-audio', 'playing')
        icon.removeClass('text-primary').addClass('text-secondary')
        icon.removeClass('fa-headphones').addClass('fa-volume-up')
      },
      onend: function() {
        icon.removeClass('fa-volume-up').addClass('fa-headphones')
        elm.attr('data-audio', 'unplayable')
        $('#exam-body').removeClass('playing')
        isNavEnabled = true
      }
    })
    
    sound.play()
  })

  // request submit
  $(document).on('click', 'span#submit-request', function () {
    $('span#submit-confirmation').removeClass('d-none')
    $('span#submit-request').addClass('d-none')
  })

  // cancel submit
  $(document).on('click', 'span#submit-cancel', function () {
    $('span#submit-request').removeClass('d-none')
    $('span#submit-confirmation').addClass('d-none')
  })

  // submit the form
  $(document).on('click', 'span#submit-confirm', function () {
    submitTheForm()
  })
});