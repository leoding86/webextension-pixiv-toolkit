/**
 * This file is used for implementing search addon feature
 */
import './styles/search.scss';
import { Storage as BrowserStorage } from '@/modules/Browser';

let browserStorage = BrowserStorage.getInstance();

browserStorage.get(null).then(items => {

  function guessElement(selectors) {
    if (typeof selectors === 'string') {
      selectors = [selectors];
    }

    for (let i = 0, l = selectors.length; i < l ; i++) {
      let target = document.querySelector(selectors[i]);

      if (target) {
        return target;
      }
    }

    return null;
  }

  if (!items.enablePtkSearch) {
    return;
  }

  let map = {
    searchContainer: ['#suggest-container', '._2fc7U5Q'],
    searchCategory: '.search-category',
    searchInput: ['#suggest-input', '._3S_e970'],
    searchSuggest: '#suggest-list',
    searchResultMid: '#js-react-search-mid'
  };

  let injected = {
    suggestList: false,
    searchResultMid: false
  };

  let searchUrlTemplate = 'https://www.pixiv.net/search.php?s_mode=s_tag&word=%word%'

  /**
   * Find suggest list
   */
  let observer = new MutationObserver(() => {
    let searchContainer = guessElement(map.searchContainer);

    if (searchContainer && !injected.suggestList) {
      let searchInput = guessElement(map.searchInput);

      injected.suggestList = true;

      console.log('Suggest list has been found, append extension search button')

      /**
       * Create a search button
       */
      let searchCategory = document.createElement('div');
      searchCategory.className = '__ptk-search-addon';

      let a_ = document.createElement('a');
      a_.href = 'javascript:void(0)';
      a_.textContent = 'PTK Search';
      a_.style.color = '#FFF';

      searchCategory.appendChild(a_);

      /**
       * Create a archer
       */
      let archer = document.createElement('div');
      archer.className = '__ptk-archer __ptk-archer-bottom-right';

      /**
       * Create a select list
       */
      let searchCategoryInnerList = document.createElement('div');
      searchCategoryInnerList.className = '__ptk-search-addon-inner-list';
      searchCategory.appendChild(archer);
      archer.appendChild(searchCategoryInnerList);

      /**
       * Insert search items to inner list
       */
      ['10000users入り', '5000users入り', '3000users入り', '1000users入り', '500users入り', '300users入り', '100users入り', '50users入り'].forEach(val => {
        let a = document.createElement('a');
        a.href = 'javascript:void(0)';
        a.setAttribute('data-suffix', val);
        a.innerText = val;

        a.addEventListener('mousedown', function() {
          let word = searchInput.value;

          word = word.replace(/\s+\d+users入り/ig, '') + ' ' + this.getAttribute('data-suffix');

          window.open(searchUrlTemplate.replace('%word%', word), '_self');
        });

        searchCategoryInnerList.appendChild(a);
      });

      searchCategory.addEventListener('mouseenter', () => {
        searchCategoryInnerList.style.display = 'block';
      });

      searchCategory.addEventListener('mouseleave', () => {
        searchCategoryInnerList.style.display = 'none';
      });

      /**
       * Insert the button to search suggest list
       */
      archer = document.createElement('div');
      archer.className = '__ptk-archer __ptk-archer-top-left';

      archer.appendChild(searchCategory);

      if (['relative', 'absolute'].indexOf(getComputedStyle(searchContainer).position) < 0) {
        searchContainer.style.position = 'relative';
      }

      searchContainer.appendChild(archer);

      searchInput.addEventListener('focus', () => {
        searchCategory.style.display = 'block';
      });

      searchInput.addEventListener('blur', () => {
        searchCategory.style.display = 'none';
      });
    }
  });

  observer.observe(document.querySelector('body'), { attributes: true, childList: true, subtree: true });
});
