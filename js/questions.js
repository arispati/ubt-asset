$(function () {
  // available media
  const availableMedia = ['text', 'image', 'audio']
  // summernote settings
  let summernoteSettings = {
    lang: 'id-ID',
    disableDragAndDrop: true,
    toolbar: [
      ['style', ['bold', 'italic', 'underline']],
      ['font', ['strikethrough', 'superscript', 'subscript']],
      ['color', ['forecolor', 'backcolor']],
      ['para', ['ul', 'ol', 'paragraph']]
    ],
    minHeight: 50
  }

  // switch media
  let switchMedia = function(element) {
    let elm = (typeof element == 'string') ? $(element) : element
    let media = elm.val();
    let target = elm.attr('data-target')
    let targetElm = $(target)
    let isUpdatePage = $('#question-form').attr('data-action') == 'update'

    if (availableMedia.includes(media)) {
      // empty target element
      targetElm.empty()
      // apply media
      $(`#media-content-template .template-${media}`).clone().appendTo(target)
      // adjust copied element
      let mediaElm = (media == 'text') ? $(`${target} textarea`) : $(`${target} input`)
      // add name attribute
      mediaElm.attr('name', targetElm.attr('data-name'))
      // set value and attribute
      if (media == targetElm.attr('data-media')) {
        if (mediaElm.prop('tagName') == 'INPUT') {
          mediaElm.attr('data-content', targetElm.attr('data-content'))
          mediaElm.attr('required', !isUpdatePage)
        } else {
          mediaElm.val(targetElm.attr('data-content'))
          mediaElm.summernote(summernoteSettings)
        }
      }
    }
  }

  // create preview media
  let createPreviewMedia = function (media, target, source) {
    elm = ''

    if (source != undefined) {
      switch (media) {
        case 'image':
          elm = document.createElement('img')
          elm.src = source
          elm.classList.add('img-fluid')
          break;
        case 'audio':
          elm = document.createElement('audio')
          elm.src = source
          elm.controls = 'controls'
          elm.classList.add('container-fluid')
          break;
      }
    }

    $(target).empty().append(elm)
  }

  // initiate summernote question
  $('#question').summernote(Object.assign({}, summernoteSettings, {minHeight: 225}));

  // initiate media
  switchMedia('#media')
  // initiate media additional
  switchMedia('#media_additional')
  // initiate answer media
  $('.answer-media-select').each(function () {
    switchMedia($(this))
  })

  // media changed
  $('select.switch-media').change(function () {
    switchMedia($(this))
  })

  // preview media
  $(document).on('click', '.preview-btn', function () {
    let template = $(this).parents('.template-container')
    let input = template.find('input')
    let files = input.prop('files')
    let media = input.attr('data-type')

    if (files.length) {
      let reader = new FileReader()
      reader.onload = function () {
        createPreviewMedia(media, '#modal-body', reader.result)
      };
      reader.readAsDataURL(files[0]);
    } else {
      createPreviewMedia(media, '#modal-body', input.attr('data-content'))
    }
    
    $('#modal-preview').modal('show')
  })
})