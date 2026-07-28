/*
 * catalog.js — all options are taken 1:1 from UIkit 3.25.20
 * (verified against dist/css/uikit.css)
 */
window.UK = (function () {
  'use strict';

  const VERSION = '3.25.20';

  const CDN = {
    css: 'https://cdn.jsdelivr.net/npm/uikit@' + VERSION + '/dist/css/uikit.min.css',
    js: 'https://cdn.jsdelivr.net/npm/uikit@' + VERSION + '/dist/js/uikit.min.js',
    icons: 'https://cdn.jsdelivr.net/npm/uikit@' + VERSION + '/dist/js/uikit-icons.min.js'
  };

  /* Breakpoints exactly as in uikit.css */
  const BREAKPOINTS = [
    { key: '', label: 'Base', hint: 'all sizes', min: 0 },
    { key: 's', label: '@s', hint: '≥ 640px', min: 640 },
    { key: 'm', label: '@m', hint: '≥ 960px', min: 960 },
    { key: 'l', label: '@l', hint: '≥ 1200px', min: 1200 },
    { key: 'xl', label: '@xl', hint: '≥ 1600px', min: 1600 }
  ];

  const VIEWPORTS = [
    { label: 'Auto', w: 0 },
    { label: 'Phone 375', w: 375 },
    { label: 'Phone 480', w: 480 },
    { label: 's 640', w: 640 },
    { label: 'm 960', w: 960 },
    { label: 'l 1200', w: 1200 },
    { label: 'xl 1600', w: 1600 },
    { label: '1920', w: 1920 }
  ];

  /* ---- Width (uk-width-*) --------------------------------------------- */
  /* responsive variants exist for these values (…@s/@m/@l/@xl) */
  const WIDTHS = [
    { v: '', t: '– none –' },
    /* uk-width-1-1 only exists with a breakpoint – 100% is the default */
    { v: '1-1', t: '1-1  (100%)', noBase: true },
    { v: '1-2', t: '1-2  (50%)' },
    { v: '1-3', t: '1-3  (33.3%)' },
    { v: '2-3', t: '2-3  (66.6%)' },
    { v: '1-4', t: '1-4  (25%)' },
    { v: '3-4', t: '3-4  (75%)' },
    { v: '1-5', t: '1-5  (20%)' },
    { v: '2-5', t: '2-5  (40%)' },
    { v: '3-5', t: '3-5  (60%)' },
    { v: '4-5', t: '4-5  (80%)' },
    { v: '1-6', t: '1-6  (16.6%)' },
    { v: '5-6', t: '5-6  (83.3%)' },
    { v: 'auto', t: 'auto' },
    { v: 'expand', t: 'expand' },
    { v: 'small', t: 'small  (150px)' },
    { v: 'medium', t: 'medium  (300px)' },
    { v: 'large', t: 'large  (450px)' },
    { v: 'xlarge', t: 'xlarge  (600px)' },
    { v: '2xlarge', t: '2xlarge  (750px)' }
  ];

  /* only exist without a breakpoint suffix */
  const WIDTHS_BASE_ONLY = [
    { v: 'fit-content', t: 'fit-content' },
    { v: 'max-content', t: 'max-content' },
    { v: 'min-content', t: 'min-content' }
  ];

  /* ---- Child-Width (uk-child-width-*) --------------------------------- */
  const CHILD_WIDTHS = [
    { v: '', t: '– none –' },
    { v: '1-1', t: '1-1', noBase: true },
    { v: '1-2', t: '1-2' },
    { v: '1-3', t: '1-3' },
    { v: '1-4', t: '1-4' },
    { v: '1-5', t: '1-5' },
    { v: '1-6', t: '1-6' },
    { v: 'auto', t: 'auto' },
    { v: 'expand', t: 'expand' }
  ];

  /* ---- Grid ------------------------------------------------------------ */
  const GRID_GUTTER = [
    { v: '', t: 'default (30/40px)' },
    { v: 'small', t: 'uk-grid-small' },
    { v: 'medium', t: 'uk-grid-medium' },
    { v: 'large', t: 'uk-grid-large' },
    { v: 'collapse', t: 'uk-grid-collapse' }
  ];
  const GRID_COLUMN_GUTTER = [
    { v: '', t: '– like gutter –' },
    { v: 'small', t: 'uk-grid-column-small' },
    { v: 'medium', t: 'uk-grid-column-medium' },
    { v: 'large', t: 'uk-grid-column-large' },
    { v: 'collapse', t: 'uk-grid-column-collapse' }
  ];
  const GRID_ROW_GUTTER = [
    { v: '', t: '– like gutter –' },
    { v: 'small', t: 'uk-grid-row-small' },
    { v: 'medium', t: 'uk-grid-row-medium' },
    { v: 'large', t: 'uk-grid-row-large' },
    { v: 'collapse', t: 'uk-grid-row-collapse' }
  ];
  const GRID_MASONRY = [
    { v: '', t: '– off –' },
    { v: 'true', t: 'masonry: true' },
    { v: 'pack', t: 'masonry: pack' },
    { v: 'next', t: 'masonry: next' }
  ];

  /* ---- Flex ------------------------------------------------------------ */
  const FLEX_H = [
    { v: '', t: '– none –' },
    { v: 'left', t: 'uk-flex-left' },
    { v: 'center', t: 'uk-flex-center' },
    { v: 'right', t: 'uk-flex-right' },
    { v: 'between', t: 'uk-flex-between' },
    { v: 'around', t: 'uk-flex-around' }
  ];
  const FLEX_V = [
    { v: '', t: '– none –' },
    { v: 'stretch', t: 'uk-flex-stretch' },
    { v: 'top', t: 'uk-flex-top' },
    { v: 'middle', t: 'uk-flex-middle' },
    { v: 'bottom', t: 'uk-flex-bottom' }
  ];
  const FLEX_DIR = [
    { v: '', t: '– none –' },
    { v: 'row', t: 'uk-flex-row' },
    { v: 'row-reverse', t: 'uk-flex-row-reverse', noResp: true },
    { v: 'column', t: 'uk-flex-column' },
    { v: 'column-reverse', t: 'uk-flex-column-reverse', noResp: true }
  ];

  const FLEX_WRAP = [
    { v: '', t: '– none –' },
    { v: 'wrap', t: 'uk-flex-wrap' },
    { v: 'nowrap', t: 'uk-flex-nowrap' },
    { v: 'wrap-reverse', t: 'uk-flex-wrap-reverse' }
  ];
  const FLEX_WRAP_ALIGN = [
    { v: '', t: '– none –' },
    { v: 'wrap-stretch', t: 'uk-flex-wrap-stretch' },
    { v: 'wrap-top', t: 'uk-flex-wrap-top' },
    { v: 'wrap-middle', t: 'uk-flex-wrap-middle' },
    { v: 'wrap-bottom', t: 'uk-flex-wrap-bottom' },
    { v: 'wrap-between', t: 'uk-flex-wrap-between' },
    { v: 'wrap-around', t: 'uk-flex-wrap-around' }
  ];
  const FLEX_ORDER = [
    { v: '', t: '– none –' },
    { v: 'first', t: 'uk-flex-first' },
    { v: 'last', t: 'uk-flex-last' }
  ];
  const FLEX_ITEM = [
    { v: '', t: '– none –' },
    { v: 'none', t: 'uk-flex-none' },
    { v: 'initial', t: 'uk-flex-initial' },
    { v: 'auto', t: 'uk-flex-auto', noResp: true },
    { v: '1', t: 'uk-flex-1' }
  ];

  /* ---- Container ------------------------------------------------------- */
  const CONTAINER_SIZE = [
    { v: '', t: 'default (1200px)' },
    { v: 'xsmall', t: 'uk-container-xsmall (750px)' },
    { v: 'small', t: 'uk-container-small (900px)' },
    { v: 'large', t: 'uk-container-large (1600px)' },
    { v: 'xlarge', t: 'uk-container-xlarge (1800px)' },
    { v: 'expand', t: 'uk-container-expand' },
    { v: 'expand-left', t: 'uk-container-expand-left' },
    { v: 'expand-right', t: 'uk-container-expand-right' }
  ];

  /* ---- Section --------------------------------------------------------- */
  const SECTION_SIZE = [
    { v: '', t: 'default (70/70px)' },
    { v: 'xsmall', t: 'uk-section-xsmall' },
    { v: 'small', t: 'uk-section-small' },
    { v: 'large', t: 'uk-section-large' },
    { v: 'xlarge', t: 'uk-section-xlarge' }
  ];
  const SECTION_EDGE = [
    { v: '', t: '– like size –' },
    { v: 'xsmall', t: 'xsmall' },
    { v: 'small', t: 'small' },
    { v: 'medium', t: 'medium' },
    { v: 'large', t: 'large' },
    { v: 'xlarge', t: 'xlarge' }
  ];
  const SECTION_STYLE = [
    { v: '', t: '– transparent –' },
    { v: 'default', t: 'uk-section-default' },
    { v: 'muted', t: 'uk-section-muted' },
    { v: 'primary', t: 'uk-section-primary' },
    { v: 'secondary', t: 'uk-section-secondary' }
  ];

  /* ---- Height ---------------------------------------------------------- */
  const HEIGHTS = [
    { v: '', t: '– none –' },
    { v: 'small', t: 'uk-height-small (150px)' },
    { v: 'medium', t: 'uk-height-medium (300px)' },
    { v: 'large', t: 'uk-height-large (450px)' },
    { v: 'max-small', t: 'uk-height-max-small (max 150px)' },
    { v: 'max-medium', t: 'uk-height-max-medium (max 300px)' },
    { v: 'max-large', t: 'uk-height-max-large (max 450px)' },
    { v: 'viewport', t: 'uk-height-viewport' },
    { v: 'viewport-2', t: 'uk-height-viewport-2' },
    { v: 'viewport-3', t: 'uk-height-viewport-3' },
    { v: 'viewport-4', t: 'uk-height-viewport-4' },
    { v: '1-1', t: 'uk-height-1-1' }
  ];

  /* ---- Padding --------------------------------------------------------- */
  const PADDING_SIZE = [
    { v: '', t: '– none –' },
    { v: 'small', t: 'uk-padding-small' },
    { v: 'default', t: 'uk-padding' },
    { v: 'large', t: 'uk-padding-large' }
  ];
  const PADDING_REMOVE = [
    { v: 'remove', t: 'uk-padding-remove' },
    { v: 'remove-top', t: '…-top' },
    { v: 'remove-bottom', t: '…-bottom' },
    { v: 'remove-left', t: '…-left' },
    { v: 'remove-right', t: '…-right' },
    { v: 'remove-vertical', t: '…-vertical' },
    { v: 'remove-horizontal', t: '…-horizontal' }
  ];

  /* ---- Margin ---------------------------------------------------------- */
  const MARGIN_SIZE = [
    { v: '', t: '– none –' },
    { v: 'xsmall', t: 'xsmall' },
    { v: 'small', t: 'small' },
    { v: 'default', t: 'default' },
    { v: 'medium', t: 'medium' },
    { v: 'large', t: 'large' },
    { v: 'xlarge', t: 'xlarge' }
  ];
  const MARGIN_SIDE = [
    { v: '', t: 'all sides (uk-margin…)' },
    { v: 'top', t: 'top' },
    { v: 'bottom', t: 'bottom' },
    { v: 'left', t: 'left' },
    { v: 'right', t: 'right' }
  ];
  const MARGIN_REMOVE = [
    { v: 'remove', t: 'uk-margin-remove' },
    { v: 'remove-top', t: '…-top' },
    { v: 'remove-bottom', t: '…-bottom' },
    { v: 'remove-vertical', t: '…-vertical' },
    { v: 'remove-adjacent', t: '…-adjacent' },
    { v: 'remove-first-child', t: '…-first-child' },
    { v: 'remove-last-child', t: '…-last-child' }
  ];
  /* uk-margin-remove-left / -right are the only remove classes
     with breakpoint variants (@s @m @l @xl) */
  const MARGIN_REMOVE_X = [
    { v: '', t: '– none –' },
    { v: 'left', t: 'uk-margin-remove-left' },
    { v: 'right', t: 'uk-margin-remove-right' },
    { v: 'both', t: 'left + right' }
  ];
  const MARGIN_AUTO = [
    { v: '', t: '– none –' },
    { v: 'auto', t: 'uk-margin-auto (horizontal)' },
    { v: 'auto-left', t: 'uk-margin-auto-left' },
    { v: 'auto-right', t: 'uk-margin-auto-right' },
    { v: 'auto-top', t: 'uk-margin-auto-top' },
    { v: 'auto-bottom', t: 'uk-margin-auto-bottom' },
    { v: 'auto-vertical', t: 'uk-margin-auto-vertical' }
  ];
  /* responsive variants per uikit.css */
  const MARGIN_AUTO_RESPONSIVE = ['auto', 'auto-left', 'auto-right'];

  /* ---- Text / Background ----------------------------------------------- */
  const TEXT_ALIGN = [
    { v: '', t: '– none –' },
    { v: 'left', t: 'uk-text-left' },
    { v: 'center', t: 'uk-text-center' },
    { v: 'right', t: 'uk-text-right' },
    { v: 'justify', t: 'uk-text-justify', noResp: true }
  ];
  const BACKGROUND = [
    { v: '', t: '– none –' },
    { v: 'default', t: 'uk-background-default' },
    { v: 'muted', t: 'uk-background-muted' },
    { v: 'primary', t: 'uk-background-primary' },
    { v: 'secondary', t: 'uk-background-secondary' }
  ];
  const INVERSE = [
    { v: '', t: '– automatic –' },
    { v: 'light', t: 'uk-light (light text)' },
    { v: 'dark', t: 'uk-dark (dark text)' }
  ];

  /* ---- Cell content --------------------------------------------- */
  const CONTENT_MODE = [
    { v: 'card', t: 'uk-card' },
    { v: 'tile', t: 'Simple block (uk-padding)' },
    { v: 'text', t: 'Text only' },
    { v: 'html', t: 'Custom HTML' },
    { v: 'empty', t: 'Empty' }
  ];
  const CARD_STYLE = [
    { v: 'default', t: 'uk-card-default' },
    { v: 'primary', t: 'uk-card-primary' },
    { v: 'secondary', t: 'uk-card-secondary' }
  ];
  const CARD_SIZE = [
    { v: '', t: 'uk-card-body' },
    { v: 'small', t: 'uk-card-small' },
    { v: 'large', t: 'uk-card-large' }
  ];

  return {
    VERSION, CDN, BREAKPOINTS, VIEWPORTS,
    WIDTHS, WIDTHS_BASE_ONLY, CHILD_WIDTHS,
    GRID_GUTTER, GRID_COLUMN_GUTTER, GRID_ROW_GUTTER, GRID_MASONRY,
    FLEX_H, FLEX_V, FLEX_DIR, FLEX_WRAP, FLEX_WRAP_ALIGN,
    FLEX_ORDER, FLEX_ITEM,
    CONTAINER_SIZE, SECTION_SIZE, SECTION_EDGE, SECTION_STYLE,
    HEIGHTS, PADDING_SIZE, PADDING_REMOVE,
    MARGIN_SIZE, MARGIN_SIDE, MARGIN_REMOVE, MARGIN_REMOVE_X, MARGIN_AUTO, MARGIN_AUTO_RESPONSIVE,
    TEXT_ALIGN, BACKGROUND, INVERSE,
    CONTENT_MODE, CARD_STYLE, CARD_SIZE
  };
})();
