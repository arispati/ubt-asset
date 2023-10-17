$(function(){
  // prevent default
  $(document).keydown(function (e) {
    e.preventDefault()
  })
  $(document).on('contextmenu', function () {
    return false
  })
  // prevent default

  // customize image from summernote
  $('#question-numbers img[src^="data:image"]').each(function () {
    $(this).removeAttr('style').addClass('img-thumbnail').wrap('<div class="col-12 col-md-8 mx-auto"></div>')
  })

  $('#question-numbers br').remove()
  // customize image from summernote

  function requestFullScreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    }
  }

  let isNavEnabled = true;
  let questionNumber = $('#question-numbers')
  let questionContainer = $('#question-container')
  let display = $('#timer')
  let duration = display.attr('data-duration')
  let timer = new CountDownTimer(duration)

  // timer handle
  function tickHandle({hours, minutes, seconds}) {
    display.text(hours + ':' + minutes + ':' + seconds)
    
    if (this.running == false) {
      let updatedBy = document.createElement('input');
      updatedBy.type = 'hidden';
      updatedBy.name = 'updated_by';
      updatedBy.value = 'system';
      $('#exam-form').append(updatedBy).submit()
    }
  }

  // run the timer
  timer.onTick(tickHandle).start()

  function toggleQuestion(number) {
    if (isNavEnabled) {
      let questionElm = $(`.question-number[data-number="${number}"]`)

      questionContainer.toggleClass('d-none')
      questionElm.toggleClass('d-none')
      questionNumber.toggleClass('d-none')
      $('.btn-tab-switch').attr('data-current', number)
    }
  }

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

  function questionCounter(category) {
    let count = $(`#tq-table-${category} .btn-question-container:not(.d-none)`).length
    let label = count > 1 ? 'Questions' : 'Question'

    return `${count} ${label}`
  }

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

  // tab toggle
  $(document).on('click', '.btn-tab-switch', function (e) {
    if (isNavEnabled) {
      $('.btn-tab-switch').removeClass('active')
      $(this).addClass('active')
      let tab = $(this).attr('data-tab')
      let activeQuestion = $('.btn-tab-switch').attr('data-current')
  
      toggleTab(tab)
  
      if (activeQuestion != undefined) {
        toggleQuestion(activeQuestion)
        $('.btn-tab-switch').removeAttr('data-current')
      }
    }
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

  // toggle fullscreen
  $(document).on('click', '.rfs', function () {
    requestFullScreen()
  })

  // show warning modal
  const modal = new bootstrap.Modal('#model-fs')
  modal.show()

  // submit answer
  $(document).on('click', '#submit-answer:not(.submitting)', function () {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, submit answers!',
      allowOutsideClick: () => {
        const popup = Swal.getPopup()
        popup.classList.remove('swal2-show')
        setTimeout(() => {
          popup.classList.add('animate__animated', 'animate__headShake')
        })
        setTimeout(() => {
          popup.classList.remove('animate__animated', 'animate__headShake')
        }, 500)
        return false
      }
    }).then((result) => {
      if (result.isConfirmed) {
        $('#submit-answer')
          .addClass('submitting')
          .html('Submitting... <div class="spinner-border spinner-border-sm" role="status"><span class="sr-only">Loading...</span></div></span>')
        $('#exam-form').submit()
      }
    })
  })
});