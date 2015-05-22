/**
 * RSmenu
 * @author RayShen(leidottw@gmail.com)
 */

(function($) {

    $.fn.RSmenu = function(menu) {
        var that = this;

        var offset = $(that).offset();
        this.top = offset.top;
        this.left = offset.left;

        if(!menu) {
            return;
        }

        if(!menu.options) {
            menu.options = {};
        }

        // set trigger event
        switch(menu.options.active) {
            case 'leftClick':
                $(this).on('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();

                    that.mouseX = e.clientX;
                    that.mouseY = e.clientY;

                    render();
                });
                break;
            default:
                $(this).on('contextmenu', function(e) {
                    e.preventDefault();
                    e.stopPropagation();

                    that.mouseX = e.clientX;
                    that.mouseY = e.clientY;

                    render();
                });
        }

        function render() {
            // execute on show
            if(menu.options.onShow) {
                menu.options.onShow();
            }

            that.$el = $('<div id="RSmenu">').appendTo('body');

            if(menu.options.debug) {
                that.$el.addClass('debug');
            }

            if(menu.options.class) {
                that.$el.addClass(menu.options.class);
            }

            that.$el.on('click contextmenu', function(e) {
                e.preventDefault();
                that.$el.remove();

                // execute on show
                if(menu.options.onClose) {
                    menu.options.onClose();
                }
            });

            renderPopUpMenu(menu);
        }

        function renderPopUpMenu(menu, parent) {
            that.trigger('createMenu', parent && parent.data('level') || 0);

            var $menuInstance = $('<div class="menu">').appendTo(that.$el);

            // 設定menu階層辨識參數
            if(parent) {
                $menuInstance.data('level', parent.data('level') + 1);
                $menuInstance.data('parent', parent);
                $menuInstance.addClass('submenu');
            } else {
                $menuInstance.data('level', 0);
            }

            // render item
            menu.data.forEach(function(item) {
                if(typeof item.hide === 'function') {
                    if(item.hide()) return;
                } else if(typeof item.hide === 'boolean') {
                    if(item.hide) return;
                }

                if(item.divider) {
                    var $itemInstance = $('<div class="divider">').appendTo($menuInstance);
                } else {
                    var $itemInstance = $('<div class="item">').html(item.text).appendTo($menuInstance);

                    if(item.class) {
                        $itemInstance.addClass(item.class);
                    }

                    if(item.isTitle) {
                        $itemInstance.data('isTitle', true);
                        $itemInstance.addClass('isTitle');
                    }

                    // 設定menu階層辨識參數
                    if(parent) {
                        $itemInstance.data('level', parent.data('level') + 1);
                        $itemInstance.data('parent', parent);
                    } else {
                        $itemInstance.data('level', 0);
                    }

                    // 若有子menu, 埋子menu設定參數
                    if(item.menu) {
                        $itemInstance.addClass('parentMenu');
                        $itemInstance.data('menu', item.menu);
                    }

                    // 滑鼠事件
                    $itemInstance.on('mouseenter', function(e) {
                        // 若為父節點則render subment
                        if(item.menu) {
                            renderPopUpMenu($itemInstance.data('menu'), $itemInstance);
                        } else {
                            that.trigger('createMenu', $itemInstance.data('level'));
                        }

                        // 光標
                        if(!$itemInstance.data('isTitle')) {
                            $itemInstance.addClass('hover');
                        }

                        // 祖先光標
                        that.$el.find('.item').removeClass('active');
                        var tmp = parent;
                        while(tmp) {
                            tmp.addClass('active');
                            tmp = tmp.data('parent');
                        }
                    }).on('mouseleave', function(e) {
                        $itemInstance.removeClass('hover');
                    }).on('click', function(e) {
                        if(item.handler) {
                            item.handler();
                        }
                    });
                }
            });

            // menu定位
            if(parent) {
                // 子menu定位
                var parentOffset = parent.offset();

                if(parentOffset.left + parent.outerWidth() + $menuInstance.outerWidth() <= $(window).width()) {
                    $menuInstance.css('left', parentOffset.left + parent.outerWidth());
                } else {
                    $menuInstance.css('left', parentOffset.left - $menuInstance.outerWidth());
                }

                if(parentOffset.top + $menuInstance.outerHeight() + parseInt($menuInstance.css('marginTop')) <= $(window).height()) {
                    $menuInstance.css('top', parentOffset.top - 1);
                } else {
                    $menuInstance.css('bottom', 0);
                    if($menuInstance.outerHeight() > $(window).height()) {
                        $menuInstance.css({
                            'top': 0,
                            'bottom': '',
                            'margin-top': 0
                        });
                        $menuInstance.css('height', $(window).height()).jScrollPane({
                            autoReinitialise: true
                        });
                    }
                }
            } else {
                // root menu定位
                if(that.mouseX + $menuInstance.outerWidth() <= $(window).width()) {
                    $menuInstance.css('left', that.mouseX);
                } else {
                    $menuInstance.css('left', that.mouseX - $menuInstance.outerWidth());
                }

                if(that.mouseY + $menuInstance.outerHeight() <= $(window).height()) {
                    $menuInstance.css('top', that.mouseY);
                } else {
                    $menuInstance.css('bottom', 0);
                    if($menuInstance.outerHeight() > $(window).height()) {
                        $menuInstance.css({
                            'top': 0,
                            'bottom': '',
                            'margin-top': 0
                        });
                        $menuInstance.css('height', $(window).height()).jScrollPane({
                            autoReinitialise: true
                        });
                    }
                }
            }
        }

        this.on('createMenu', function(e, level) {
            if(that.$el) {
                var allMenu = that.$el.find('.menu');

                allMenu.each(function(index, menu) {
                    if($(menu).data('level') > level) {
                        $(menu).remove();
                    }
                });
            }
        });
    };

    $.fn.RSdropdown = function(menu) {
        var that = this;

        if(!menu) {
            menu = {
                data: []
            };
        }

        if(!menu.options) {
            menu.options = {};
        }

        // replace origin select menu
        $(that).hide();
        if($(that)[0].tagName === 'SELECT') {
            $(that).find('option').each(function(key, option) {
                menu.data.push({
                    text: $(option).text(),
                    val: $(option).val()
                })
            });
        }

        that.$dropdownHead = $('<div class="RSdropdownHead">').html(menu.data[0].text).attr('value', menu.data[0].val)/*.attr('title', menu.data[0].text)*/;

        if(menu.options.width) {
            that.$dropdownHead.css('width', menu.options.width);
        }

        if(menu.options.headClass) {
            that.$dropdownHead.addClass(menu.options.headClass);
        }

        $(that).after(that.$dropdownHead);

        that.$dropdownHead.on('click', function() {
            // execute on show
            if(menu.options.onShow) {
                menu.options.onShow();
            }

            that.$el = $('<div id="RSdropdown">').appendTo('body');

            that.$dropdownHead.addClass('active');

            if(menu.options.debug) {
                that.$el.addClass('debug');
            }

            if(menu.options.class) {
                that.$el.addClass(menu.options.class);
            }

            that.$el.on('click contextmenu', function(e) {
                e.preventDefault();
                that.$el.remove();

                that.$dropdownHead.removeClass('active');

                // execute on show
                if(menu.options.onClose) {
                    menu.options.onClose();
                }
            });

            renderDropdown(menu);
        });

        function renderDropdown(menu, parent) {
            that.trigger('createMenu', parent && parent.data('level') || 0);

            var $menuInstance = $('<div class="menu">').appendTo(that.$el);

            // 設定menu階層辨識參數
            if(parent) {
                $menuInstance.data('level', parent.data('level') + 1);
                $menuInstance.data('parent', parent);
                $menuInstance.addClass('submenu');
            } else {
                $menuInstance.data('level', 0);
            }

            // render item
            menu.data.forEach(function(item) {
                if(typeof item.hide === 'function') {
                    if(item.hide()) return;
                } else if(typeof item.hide === 'boolean') {
                    if(item.hide) return;
                }

                if(item.divider) {
                    var $itemInstance = $('<div class="divider">').appendTo($menuInstance);
                } else {
                    var $itemInstance = $('<div class="item">').html(item.text)/*.attr('title', item.text)*/.appendTo($menuInstance);

                    if(item.class) {
                        $itemInstance.addClass(item.class);
                    }

                    if(item.isTitle) {
                        $itemInstance.data('isTitle', true);
                        $itemInstance.addClass('isTitle');
                    }

                    // 設定menu階層辨識參數
                    if(parent) {
                        $itemInstance.data('level', parent.data('level') + 1);
                        $itemInstance.data('parent', parent);
                    } else {
                        $itemInstance.data('level', 0);
                    }

                    // 若有子menu, 埋子menu設定參數
                    if(item.menu) {
                        $itemInstance.addClass('parentMenu');
                        $itemInstance.data('menu', item.menu);
                    }

                    // 已選擇項目標記
                    // 已選擇項目的parents標記
                    if(that.$dropdownHead.attr('value') === item.val) {
                        $itemInstance.addClass('selected');
                    } else if(item.menu) {
                        var searchArray = [item];
                        
                        while(searchArray.length) {
                            search(searchArray[0], that.$dropdownHead.attr('value'));
                            searchArray.shift();
                        }

                        function search(item, val) {
                            if(item.menu) {
                                $.each(item.menu.data, function(key, item) {
                                    searchArray.push(item);
                                });
                            } else {
                                if(item.val === val) {
                                    $itemInstance.addClass('parentOfSelected');
                                }
                            }
                        }
                    }

                    // 滑鼠事件
                    $itemInstance.on('mouseenter', function(e) {
                        // 若為父節點則render subment
                        if(item.menu) {
                            renderDropdown($itemInstance.data('menu'), $itemInstance);
                        } else {
                            that.trigger('createMenu', $itemInstance.data('level'));
                        }

                        // 光標
                        if(!$itemInstance.data('isTitle')) {
                            $itemInstance.addClass('hover');
                        }

                        // 祖先光標
                        that.$el.find('.item').removeClass('active');
                        var tmp = parent;
                        while(tmp) {
                            tmp.addClass('active');
                            tmp = tmp.data('parent');
                        }
                    }).on('mouseleave', function(e) {
                        $itemInstance.removeClass('hover');
                    }).on('click', function(e) {
                        // 非title && 非父節點
                        if(!item.isTitle && !item.menu) {
                            $(that).trigger('change', item.val);
                            that.$dropdownHead.html(item.text)/*.attr('title', item.text)*/.attr('value', item.val);
                        }

                        // 若有handler則執行
                        if(item.handler) {
                            item.handler();
                        }
                    });
                }
            });

            // menu定位
            if(parent) {
                // 子menu定位
                var parentOffset = parent.offset();

                if(parentOffset.left + parent.outerWidth() + $menuInstance.outerWidth() <= $(window).width()) {
                    $menuInstance.css('left', parentOffset.left + parent.outerWidth());
                } else {
                    $menuInstance.css('left', parentOffset.left - $menuInstance.outerWidth());
                }

                if(parentOffset.top + $menuInstance.outerHeight() + parseInt($menuInstance.css('marginTop')) <= $(window).height()) {
                    $menuInstance.css('top', parentOffset.top - 1);
                } else {
                    $menuInstance.css('bottom', 0);
                    if($menuInstance.outerHeight() > $(window).height()) {
                        $menuInstance.css({
                            'top': 0,
                            'bottom': '',
                            'margin-top': 0
                        });
                        $menuInstance.css('height', $(window).height()).jScrollPane({
                            autoReinitialise: true
                        });
                    }
                }
            } else {
                // root menu定位
                var offset = that.$dropdownHead.offset();

                $menuInstance.css('left', offset.left);
                $menuInstance.css('width', that.$dropdownHead.outerWidth());

                if(offset.top + that.$dropdownHead.outerHeight() + $menuInstance.outerHeight() <= $(window).height()) {
                    $menuInstance.css('top', offset.top + that.$dropdownHead.outerHeight());
                } else {
                    if(offset.top > $(window).height() - offset.top) { // menu上方空間 > 下方空間
                        $menuInstance.css('top', offset.top - $menuInstance.outerHeight());
                        if($menuInstance.outerHeight() > offset.top) {
                            $menuInstance.css('height', offset.top).jScrollPane({
                                autoReinitialise: true
                            });
                        }
                    } else {
                        $menuInstance.css('top', offset.top + that.$dropdownHead.outerHeight());
                        if($menuInstance.outerHeight() + offset.top > $(window).height()) {
                            $menuInstance.css('height', $(window).height() - (offset.top + that.$dropdownHead.outerHeight())).jScrollPane({
                                autoReinitialise: true
                            });
                        }
                    }
                }
            }
        }

        this.on('createMenu', function(e, level) {
            if(that.$el) {
                var allMenu = that.$el.find('.menu');

                allMenu.each(function(index, menu) {
                    if($(menu).data('level') > level) {
                        $(menu).remove();
                    }
                });
            }
        });

        return this;
    }

})(jQuery);