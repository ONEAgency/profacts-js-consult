queryString = require "query-string"
cookies = require "browser-cookies"

src = document.getElementById('profacts-modal').src.split(".js")[1];

module.exports = class ProfactsModal
  constructor: (options) ->
    {
      @startdate = "2015-01-01T0:00:01" # popup will be shown from this date
      @enddate = "2016-01-01T0:00:01" # popup will be shown until this date

      @showratio = 100 # 100 percent chance of showing
      @expireratio = 0 # when popup is shown it will show again in 0hs

      @hideafteraccept = false

      @campaignkey = "profactscampaign" #this is the key that will be used to create
      @templategroupname = "profactsmodaltemplates"
      @templatename = "popup_1"
    } = options

  init: () ->
    do @handleRequestParams
    @inrange = @checkDate(@getRequestParram("startdate"), @getRequestParram("enddate"))
    if @inrange
      do @makePopup
      @shouldshowbyratio = @checkShowRatio(@getRequestParram("showratio"))

      if @shouldshowbyratio
        unless cookies.get("#{@getRequestParram("campaignkey")}_expire") or cookies.get("#{@getRequestParram("campaignkey")}_accepted")
          do @showPopup
          do @attachEvents

  getTemplate: () ->
    @template = window[@getRequestParram("templategroupname")][@getRequestParram("templatename")]

  makePopup: () ->
    template = @getTemplate()
    @wrapper = document.createElement "div"
    @wrapper.id = "modal-wrapper"
    @wrapper.innerHTML = @template()
    document.body.appendChild @wrapper

  showPopup: () ->
    @makeExpireCookie(@getRequestParram("expireratio"))
    setTimeout ->
      document.querySelector('#modal-wrapper').classList.add("added")
    , 500

    setTimeout ->
      document.querySelector('#modal-wrapper').classList.add("shown")
    , 1000

  hidePopup: () ->
    setTimeout ->
      document.querySelector('#modal-wrapper').classList.remove("shown")
    , 500

    setTimeout ->
      document.querySelector('#modal-wrapper').classList.remove("added")
    , 1000


  attachEvents: () ->
    document.querySelector('#modal-wrapper .overlay').addEventListener 'click', =>
      if document.querySelector('#modal-wrapper').classList.contains('shown')
        @hidePopup()

    document.querySelector('#modal-wrapper .button-accept').addEventListener 'click', =>
      if document.querySelector('#modal-wrapper').classList.contains('shown')
        cookies.set("#{@getRequestParram("campaignkey")}_accepted", "true",
          expires: @addHours(new Date(@getRequestParram("enddate")), @getTimeZone())
        )
        if @getRequestParram("hideafteraccept") is "true"
          @hidePopup()

    document.querySelector('#modal-wrapper .button-decline').addEventListener 'click', =>
      if document.querySelector('#modal-wrapper').classList.contains('shown')
        @hidePopup()

  makeExpireCookie: (expireratio) ->
    addfunc = @minutesOrHours expireratio
    nowPlusRatio = addfunc new Date(), parseInt(expireratio, 10)

    cookies.set("#{@getRequestParram("campaignkey")}_expire", "true",
      expires: nowPlusRatio
    )

  checkDate: (start, end) ->
    startDate = @addHours(new Date(start), @getTimeZone()).getTime()
    now = new Date().getTime()
    endDate = @addHours(new Date(end), @getTimeZone()).getTime()
    if startDate < now < endDate then true else false

  checkShowRatio: (r) ->
    random = Math.round Math.random() * 100
    if random <= r then true else false

  minutesOrHours: (s) ->
    s = s.toString()

    if s.indexOf("m") > -1
      return @addMinutes

    if s.indexOf("h") > -1
      return @addHours

    return @addHours

  addHours: (d, h) ->
    d.setHours d.getHours() + h
    return d

  addMinutes: (d, m) ->
    d.setMinutes d.getMinutes() + m
    return d

  getTimeZone: -> -new Date().getTimezoneOffset() / 60

  getRequestParram: (key)->
    unless @reqparams[key]?
      if key is "campaignkey" and @[key] is "profactscampaign"
        console.log "WARNING: every campaign should have a campaignkey. This key is used to create the modal cookies."
      return @[key]
    else
      return @reqparams[key]

  handleRequestParams: () ->
    @reqparams = queryString.parse(src)
