/**
 * RSMenu
 * @author RayShen(leidottw@gmail.com)
 */

(function($) {

    $.fn.RSmenu = function(menu) {
        var that = this;

        var offset = $(that).offset();
        this.top = offset.top;
        this.left = offset.left;

        if(!menu.options) {
            menu.options = {};
        }

        // setTriggerEvent
        if(menu.options.active) {
            setTriggerEvent.call(this);
        } else {
            menu.options.active = 'default';
            setTriggerEvent.call(this);
        }

        function setTriggerEvent() {
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
        }

        function render() {
            // execute on show
            if(menu.options) {
                if(menu.options.onShow) {
                    menu.options.onShow();
                }
            }

            that.$el = $('<div id="RSMenu">').appendTo('body');

            if(menu.options && menu.options.debug) {
                that.$el.addClass('debug');
            }

            // type
            switch(menu.options.type) {
                case 'dropdown':
                    break;
                default: // pop-up menu
                    renderPopUpMenu(menu);
            }

            that.$el.on('click contextmenu', function(e) {
                e.preventDefault();
                that.$el.remove();

                // execute on show
                if(menu.options) {
                    if(menu.options.onClose) {
                        menu.options.onClose();
                    }
                }
            });
        }

        function renderPopUpMenu(menu, parent) {
            that.trigger('createMenu', parent && parent.data('level') || 0);

            var $menuInstance = $('<div class="menu">').appendTo(that.$el);

            // 設定menu階層辨識參數
            if(parent) {
                $menuInstance[0].dataset.level = parent.data('level') + 1;
                $menuInstance.data('parent', parent);
                $menuInstance.addClass('submenu');
            } else {
                $menuInstance[0].dataset.level = 0;
            }

            // render item
            menu.data.forEach(function(item) {
                if(item.hide) return;

                if(item.divider) {
                    var $itemInstance = $('<div class="divider">').appendTo($menuInstance);
                } else {
                    var $itemInstance = $('<div class="item">').html(item.text).appendTo($menuInstance);

                    if(item.class) {
                        $itemInstance.addClass(item.class);
                    }

                    // 設定menu階層辨識參數
                    if(parent) {
                        $itemInstance[0].dataset.level = parent.data('level') + 1;
                        $itemInstance.data('parent', parent);
                    } else {
                        $itemInstance[0].dataset.level = 0;
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
                            that.trigger('createMenu', $itemInstance[0].dataset.level);
                        }

                        // 光標
                        $itemInstance.addClass('hover');

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
                        $menuInstance.height($(window).height()).jScrollPane({
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
                        $menuInstance.height($(window).height()).jScrollPane({
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

})(jQuery);