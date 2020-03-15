import $ from 'jquery';
import 'air-datepicker';

const DatepickerRange = function DatepickerDateRange($element) {
  this.init($element);
};

DatepickerRange.prototype.init = function init($element) {
  this.emptyValue = 'ДД.ММ.ГГГГ';

  this.selectorDropdownFrom = '.js-datepicker-range__dropdown-group-from .js-datepicker-range__dropdown';
  this.selectorInputFrom = '.js-datepicker-range__dropdown-group-from input';
  this.selectorDropdownTo = '.js-datepicker-range__dropdown-group-to .js-datepicker-range__dropdown';
  this.selectorInputTo = '.js-datepicker-range__dropdown-group-to input';
  this.selectorToggleButton = '.js-dropdown__toggle-button';

  this.selectorClearButton = '[data-action="clear"]';
  this.selectorApplyButton = '[data-action="apply"]';

  this.$inputFrom = $element.find(this.selectorInputFrom);
  this.$inputTo = $element.find(this.selectorInputTo);

  this.$dropdownFrom = $element.find(this.selectorDropdownFrom);
  this.$dropdownTo = $element.find(this.selectorDropdownTo);

  this.$datepickerContainer = $element.find('.js-datepicker-range__datepicker-container');

  this.currentInputValues = [];
  this.isInline = $element.hasClass('js-datepicker-range_theme_inline');

  this.initDatepicker($element);

  this.setDates();
  this.addEventListeners();

  if (this.isInline) {
    this.$datepickerApi.show();
  }
};

DatepickerRange.prototype.initDatepicker = function initDatepicker() {
  const that = this;
  this.$datepickerApi = this.$datepickerContainer.datepicker({
    range: true,
    minDate: new Date(),
    disableNavWhenOutOfRange: !this.isInline,
    navTitles: {
      days: 'MM <i>yyyy</i>',
    },
    prevHtml: '<span class="material-icons">arrow_back</span>',
    nextHtml: '<span class="material-icons">arrow_forward</span>',
    onShow(inst) {
      that.addButtons(inst.$datepicker);
    },
    onSelect() {
      // We shouldn't change input values immediately
      that.$inputFrom.val(that.currentInputValues[0]);
      that.$inputTo.val(that.currentInputValues[1]);
    },
  }).data('datepicker');
};

DatepickerRange.prototype.addEventListeners = function addEventListeners() {
  this.$dropdownFrom.find(this.selectorToggleButton).on('click', this.handleToggleButtonClick.bind(this));
  this.$dropdownTo.find(this.selectorToggleButton).on('click', this.handleToggleButtonClick.bind(this));
};

DatepickerRange.prototype.handleToggleButtonClick = function handleToggleButtonClick() {
  const isVisible = this.$datepickerApi.$el.find('.datepicker').is(':visible');
  if (isVisible) {
    this.$datepickerApi.hide();
  } else {
    this.$datepickerApi.show();
  }
};

DatepickerRange.prototype.setDates = function setDates() {
  this.currentInputValues[0] = this.$inputFrom.val();
  this.currentInputValues[1] = this.$inputTo.val();

  const arrIsoFrom = this.$inputFrom.val().split('.');
  const arrIsoTo = this.$inputTo.val().split('.');

  const dateFrom = new Date(`${arrIsoFrom[2]}-${arrIsoFrom[1]}-${arrIsoFrom[0]}`);
  const dateTo = new Date(`${arrIsoTo[2]}-${arrIsoTo[1]}-${arrIsoTo[0]}`);

  const initDates = [];

  if (dateFrom instanceof Date && !Number.isNaN(dateFrom.getTime())) {
    initDates.push(dateFrom);
  }
  if (dateTo instanceof Date && !Number.isNaN(dateTo.getTime())) {
    initDates.push(dateTo);
  }

  if (initDates.length > 0) {
    this.$datepickerApi.selectDate(initDates);
  }
};

DatepickerRange.prototype.clear = function clear() {
  this.$dropdownFrom.find('.dropdown__input').val(this.emptyValue);
  this.$dropdownTo.find('.dropdown__input').val(this.emptyValue);
  this.currentInputValues = [this.emptyValue, this.emptyValue];
};

DatepickerRange.prototype.update = function update() {
  const dates = this.$datepickerApi.selectedDates;

  if (dates.length === 0) return;

  const ddFrom = `0${dates[0].getDate()}`.slice(-2);
  const mmFrom = `0${dates[0].getMonth() + 1}`.slice(-2);
  const yyyyFrom = dates[0].getFullYear();

  const formatFrom = `${ddFrom}.${mmFrom}.${yyyyFrom}`;

  this.$dropdownFrom.find('.js-dropdown__input').val(formatFrom);
  this.currentInputValues[0] = formatFrom;

  if (dates.length > 1) {
    const ddTo = `0${dates[1].getDate()}`.slice(-2);
    const mmTo = `0${dates[1].getMonth() + 1}`.slice(-2);
    const yyyyTo = dates[1].getFullYear();

    const formatTo = `${ddTo}.${mmTo}.${yyyyTo}`;

    this.$dropdownTo.find('.js-dropdown__input').val(formatTo);
    this.currentInputValues[1] = formatTo;
  }
};

DatepickerRange.prototype.addButtons = function addButtons($dpElement) {
  const $clearBtn = this.createButton('clear', 'Очистить');
  const $applyBtn = this.createButton('apply', 'Применить');
  if ($dpElement.find(this.selectorClearButton).length === 0) {
    $clearBtn.on('click', this.handleClearButtonClick.bind(this));
  }
  if ($dpElement.find(this.selectorApplyButton).length === 0) {
    $applyBtn.on('click', this.handleApplyButtonClick.bind(this));
  }
  if ($dpElement.find('.js-datepicker__footer').length === 0) {
    const $footer = $('<div class="datepicker__footer js-datepicker__footer"></div>');
    $footer.append($clearBtn).append($applyBtn);
    $dpElement.append($footer);
  }
};

DatepickerRange.prototype.createButton = function createButton(action, caption) {
  const clearClass = action === 'clear' ? 'button_color_gray' : '';
  const template = `<button class="button button_theme_textual ${clearClass}" type="button" data-action="${action}">
                      <div class="button__inner-wrapper">
                        <span class="button__caption">${caption}</span>
                      </div>
                    </button>`;
  return $(template);
};

DatepickerRange.prototype.handleClearButtonClick = function handleClearButtonClick() {
  if (this.isInline) return;

  this.$datepickerApi.clear();
  this.clear();
};

DatepickerRange.prototype.handleApplyButtonClick = function handleApplyButtonClick() {
  if (this.isInline) return;

  this.$datepickerApi.hide();
  this.update();
};

$(() => $('.js-datepicker-range').each((i, o) => new DatepickerRange($(o))));