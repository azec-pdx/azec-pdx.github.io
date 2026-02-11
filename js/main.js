/* eslint-disable node/no-unsupported-features/node-builtins */
(function($, moment, ClipboardJS, config) {
    $('.article img:not(".not-gallery-item")').each(function() {
        // wrap images with link and add caption if possible
        if ($(this).parent('a').length === 0) {
            $(this).wrap('<a class="gallery-item" href="' + $(this).attr('src') + '"></a>');
            if (this.alt) {
                $(this).after('<p class="has-text-centered is-size-6 caption">' + this.alt + '</p>');
            }
        }
    });

    if (typeof $.fn.lightGallery === 'function') {
        $('.article').lightGallery({ selector: '.gallery-item' });
    }
    if (typeof $.fn.justifiedGallery === 'function') {
        if ($('.justified-gallery > p > .gallery-item').length) {
            $('.justified-gallery > p > .gallery-item').unwrap();
        }
        $('.justified-gallery').justifiedGallery();
    }

    if (typeof moment === 'function') {
        $('.article-meta time').each(function() {
            $(this).text(moment($(this).attr('datetime')).fromNow());
        });
    }

    $('.article > .content > table').each(function() {
        if ($(this).width() > $(this).parent().width()) {
            $(this).wrap('<div class="table-overflow"></div>');
        }
    });

    function adjustNavbar() {
        const navbarWidth = $('.navbar-main .navbar-start').outerWidth() + $('.navbar-main .navbar-end').outerWidth();
        if ($(document).outerWidth() < navbarWidth) {
            $('.navbar-main .navbar-menu').addClass('justify-content-start');
        } else {
            $('.navbar-main .navbar-menu').removeClass('justify-content-start');
        }
    }
    adjustNavbar();
    $(window).resize(adjustNavbar);

    function toggleFold(codeBlock, isFolded) {
        const $toggle = $(codeBlock).find('.fold i');
        !isFolded ? $(codeBlock).removeClass('folded') : $(codeBlock).addClass('folded');
        !isFolded ? $toggle.removeClass('fa-angle-right') : $toggle.removeClass('fa-angle-down');
        !isFolded ? $toggle.addClass('fa-angle-down') : $toggle.addClass('fa-angle-right');
    }

    function createFoldButton(fold) {
        return '<span class="fold">' + (fold === 'unfolded' ? '<i class="fas fa-angle-down"></i>' : '<i class="fas fa-angle-right"></i>') + '</span>';
    }

    $('figure.highlight table').wrap('<div class="highlight-body">');
    if (typeof config !== 'undefined'
        && typeof config.article !== 'undefined'
        && typeof config.article.highlight !== 'undefined') {

        $('figure.highlight').addClass('hljs');
        $('figure.highlight .code .line span').each(function() {
            const classes = $(this).attr('class').split(/\s+/);
            for (const cls of classes) {
                $(this).addClass('hljs-' + cls);
                $(this).removeClass(cls);
            }
        });


        const clipboard = config.article.highlight.clipboard;
        const fold = config.article.highlight.fold.trim();

        $('figure.highlight').each(function() {
            if ($(this).find('figcaption').length) {
                $(this).find('figcaption').addClass('level is-mobile');
                $(this).find('figcaption').append('<div class="level-left">');
                $(this).find('figcaption').append('<div class="level-right">');
                $(this).find('figcaption div.level-left').append($(this).find('figcaption').find('span'));
                $(this).find('figcaption div.level-right').append($(this).find('figcaption').find('a'));
            } else {
                if (clipboard || fold) {
                    $(this).prepend('<figcaption class="level is-mobile"><div class="level-left"></div><div class="level-right"></div></figcaption>');
                }
            }
        });

        if (typeof ClipboardJS !== 'undefined' && clipboard) {
            $('figure.highlight').each(function() {
                const id = 'code-' + Date.now() + (Math.random() * 1000 | 0);
                const button = '<a href="javascript:;" class="copy" title="Copy" data-clipboard-target="#' + id + ' .code"><i class="fas fa-copy"></i></a>';
                $(this).attr('id', id);
                $(this).find('figcaption div.level-right').append(button);
            });
            new ClipboardJS('.highlight .copy'); // eslint-disable-line no-new
        }

        if (fold) {
            $('figure.highlight').each(function() {
                $(this).addClass('foldable'); // add 'foldable' class as long as fold is enabled

                if ($(this).find('figcaption').find('span').length > 0) {
                    const span = $(this).find('figcaption').find('span');
                    if (span[0].innerText.indexOf('>folded') > -1) {
                        span[0].innerText = span[0].innerText.replace('>folded', '');
                        $(this).find('figcaption div.level-left').prepend(createFoldButton('folded'));
                        toggleFold(this, true);
                        return;
                    }
                }
                $(this).find('figcaption div.level-left').prepend(createFoldButton(fold));
                toggleFold(this, fold === 'folded');
            });

            $('figure.highlight figcaption .level-left').click(function() {
                const $code = $(this).closest('figure.highlight');
                toggleFold($code.eq(0), !$code.hasClass('folded'));
            });
        }
    }

    if (config && config.appearance && config.appearance.enable) {
        const appearance = config.appearance;
        const storageKey = appearance.storageKey || 'icarus:color-scheme';
        const defaultScheme = appearance.defaultScheme || 'light';
        const prefersColorScheme = appearance.prefersColorScheme !== false;
        const mediaQuery = typeof window.matchMedia === 'function' ? window.matchMedia('(prefers-color-scheme: dark)') : null;
        const docEl = document.documentElement;
        const $themeToggle = $('.navbar-theme-toggle');
        let hasStoredPreference = false;
        let storedScheme = null;

        try {
            storedScheme = localStorage.getItem(storageKey);
        } catch (error) {
            storedScheme = null;
        }

        if (storedScheme === 'light' || storedScheme === 'dark') {
            hasStoredPreference = true;
        } else {
            storedScheme = null;
        }

        function applyTheme(scheme, persist) { // eslint-disable-line no-inner-declarations
            const normalized = scheme === 'dark' ? 'dark' : 'light';
            if (docEl) {
                docEl.dataset.theme = normalized;
                docEl.classList.remove('theme-dark', 'theme-light');
                docEl.classList.add('theme-' + normalized);
            }
            if (document.body) {
                document.body.classList.remove('theme-dark', 'theme-light');
                document.body.classList.add('theme-' + normalized);
            }
            const lightLink = document.getElementById('hljs-light-theme');
            const darkLink = document.getElementById('hljs-dark-theme');
            if (lightLink && darkLink) {
                if (normalized === 'dark') {
                    lightLink.setAttribute('disabled', 'disabled');
                    darkLink.removeAttribute('disabled');
                } else {
                    darkLink.setAttribute('disabled', 'disabled');
                    lightLink.removeAttribute('disabled');
                }
            }
            $themeToggle.attr('aria-pressed', normalized === 'dark');
            if (persist) {
                try {
                    localStorage.setItem(storageKey, normalized);
                    hasStoredPreference = true;
                    storedScheme = normalized;
                } catch (error) {
                    // Ignore write errors (private mode, etc.)
                }
            }
        }

        function getInitialScheme() { // eslint-disable-line no-inner-declarations
            if (storedScheme) {
                return storedScheme;
            }
            if (defaultScheme === 'dark') {
                return 'dark';
            }
            if (defaultScheme === 'auto' && mediaQuery && prefersColorScheme) {
                return mediaQuery.matches ? 'dark' : 'light';
            }
            if (defaultScheme === 'light') {
                return 'light';
            }
            if (prefersColorScheme && mediaQuery && mediaQuery.matches) {
                return 'dark';
            }
            return 'light';
        }

        applyTheme(getInitialScheme(), false);

        if ($themeToggle.length) {
            $themeToggle.on('click', () => {
                const nextScheme = docEl && docEl.dataset.theme === 'dark' ? 'light' : 'dark';
                applyTheme(nextScheme, true);
            });
        }

        function handlePreferenceChange(event) { // eslint-disable-line no-inner-declarations
            if (defaultScheme === 'auto' && !hasStoredPreference) {
                applyTheme(event.matches ? 'dark' : 'light', false);
            }
        }

        if (mediaQuery && prefersColorScheme) {
            if (typeof mediaQuery.addEventListener === 'function') {
                mediaQuery.addEventListener('change', handlePreferenceChange);
            } else if (typeof mediaQuery.addListener === 'function') {
                mediaQuery.addListener(handlePreferenceChange);
            }
        }
    }

    const $toc = $('#toc');
    if ($toc.length > 0) {
        const $mask = $('<div>');
        $mask.attr('id', 'toc-mask');

        $('body').append($mask);

        function toggleToc() { // eslint-disable-line no-inner-declarations
            $toc.toggleClass('is-active');
            $mask.toggleClass('is-active');
        }

        $toc.on('click', toggleToc);
        $mask.on('click', toggleToc);
        $('.navbar-main .catalogue').on('click', toggleToc);
    }
}(jQuery, window.moment, window.ClipboardJS, window.IcarusThemeSettings));
