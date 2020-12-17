
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot(slot, slot_definition, ctx, $$scope, dirty, get_slot_changes_fn, get_slot_context_fn) {
        const slot_changes = get_slot_changes(slot_definition, $$scope, dirty, get_slot_changes_fn);
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function add_flush_callback(fn) {
        flush_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);

    function bind(component, name, callback) {
        const index = component.$$.props[name];
        if (index !== undefined) {
            component.$$.bound[index] = callback;
            callback(component.$$.ctx[index]);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.31.0' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* src/Tooltip.svelte generated by Svelte v3.31.0 */

    const file = "src/Tooltip.svelte";

    // (10:4) {:else}
    function create_else_block(ctx) {
    	let span;
    	let t;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(/*text*/ ctx[0]);
    			set_style(span, "right", "80px");
    			attr_dev(span, "class", "tooltiptext other svelte-1qrcj1g");
    			add_location(span, file, 10, 8, 205);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*text*/ 1) set_data_dev(t, /*text*/ ctx[0]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(10:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (8:4) {#if dir === "left"}
    function create_if_block(ctx) {
    	let span;
    	let t;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(/*text*/ ctx[0]);
    			attr_dev(span, "class", "tooltiptext svelte-1qrcj1g");
    			add_location(span, file, 8, 8, 145);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*text*/ 1) set_data_dev(t, /*text*/ ctx[0]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(8:4) {#if dir === \\\"left\\\"}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let div;
    	let t;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[3].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[2], null);

    	function select_block_type(ctx, dirty) {
    		if (/*dir*/ ctx[1] === "left") return create_if_block;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			t = space();
    			if_block.c();
    			attr_dev(div, "class", "parent svelte-1qrcj1g");
    			add_location(div, file, 5, 0, 73);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			append_dev(div, t);
    			if_block.m(div, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 4) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[2], dirty, null, null);
    				}
    			}

    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(div, null);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    			if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Tooltip", slots, ['default']);
    	let { text = "" } = $$props;
    	let { dir = "left" } = $$props;
    	const writable_props = ["text", "dir"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Tooltip> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("text" in $$props) $$invalidate(0, text = $$props.text);
    		if ("dir" in $$props) $$invalidate(1, dir = $$props.dir);
    		if ("$$scope" in $$props) $$invalidate(2, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({ text, dir });

    	$$self.$inject_state = $$props => {
    		if ("text" in $$props) $$invalidate(0, text = $$props.text);
    		if ("dir" in $$props) $$invalidate(1, dir = $$props.dir);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [text, dir, $$scope, slots];
    }

    class Tooltip extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, { text: 0, dir: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Tooltip",
    			options,
    			id: create_fragment.name
    		});
    	}

    	get text() {
    		throw new Error("<Tooltip>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set text(value) {
    		throw new Error("<Tooltip>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get dir() {
    		throw new Error("<Tooltip>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set dir(value) {
    		throw new Error("<Tooltip>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/SubTimer.svelte generated by Svelte v3.31.0 */
    const file$1 = "src/SubTimer.svelte";

    // (46:4) {:else}
    function create_else_block$1(ctx) {
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "START";
    			attr_dev(button, "id", "start");
    			attr_dev(button, "class", "svelte-kdaeta");
    			add_location(button, file$1, 46, 8, 1263);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*click_handler_1*/ ctx[10], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(46:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (44:4) {#if activated}
    function create_if_block$1(ctx) {
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "STOP";
    			attr_dev(button, "id", "stop");
    			attr_dev(button, "class", "svelte-kdaeta");
    			add_location(button, file$1, 44, 8, 1174);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*click_handler*/ ctx[9], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(44:4) {#if activated}",
    		ctx
    	});

    	return block;
    }

    // (50:4) <Tooltip text="Divides its time amongst siblings after deletion." dir="left">
    function create_default_slot(ctx) {
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "DELETE & ÷";
    			attr_dev(button, "class", "delete svelte-kdaeta");
    			add_location(button, file$1, 50, 8, 1507);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*divDelete*/ ctx[4], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(50:4) <Tooltip text=\\\"Divides its time amongst siblings after deletion.\\\" dir=\\\"left\\\">",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let div;
    	let input;
    	let t0;
    	let span;
    	let t1;
    	let t2;
    	let t3;
    	let button;
    	let t5;
    	let tooltip;
    	let current;
    	let mounted;
    	let dispose;

    	function select_block_type(ctx, dirty) {
    		if (/*activated*/ ctx[0]) return create_if_block$1;
    		return create_else_block$1;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	tooltip = new Tooltip({
    			props: {
    				text: "Divides its time amongst siblings after deletion.",
    				dir: "left",
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			input = element("input");
    			t0 = space();
    			span = element("span");
    			t1 = text(/*displaySeconds*/ ctx[3]);
    			t2 = space();
    			if_block.c();
    			t3 = space();
    			button = element("button");
    			button.textContent = "DELETE";
    			t5 = space();
    			create_component(tooltip.$$.fragment);
    			attr_dev(input, "type", "text");
    			attr_dev(input, "placeholder", "ID");
    			attr_dev(input, "class", "svelte-kdaeta");
    			add_location(input, file$1, 41, 4, 1057);
    			attr_dev(span, "class", "svelte-kdaeta");
    			add_location(span, file$1, 42, 4, 1116);
    			attr_dev(button, "class", "delete svelte-kdaeta");
    			add_location(button, file$1, 48, 4, 1347);
    			attr_dev(div, "class", "container svelte-kdaeta");
    			add_location(div, file$1, 40, 0, 1029);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, input);
    			set_input_value(input, /*name*/ ctx[2]);
    			append_dev(div, t0);
    			append_dev(div, span);
    			append_dev(span, t1);
    			append_dev(div, t2);
    			if_block.m(div, null);
    			append_dev(div, t3);
    			append_dev(div, button);
    			append_dev(div, t5);
    			mount_component(tooltip, div, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "input", /*input_input_handler*/ ctx[8]),
    					listen_dev(button, "click", /*click_handler_2*/ ctx[11], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*name*/ 4 && input.value !== /*name*/ ctx[2]) {
    				set_input_value(input, /*name*/ ctx[2]);
    			}

    			if (!current || dirty & /*displaySeconds*/ 8) set_data_dev(t1, /*displaySeconds*/ ctx[3]);

    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(div, t3);
    				}
    			}

    			const tooltip_changes = {};

    			if (dirty & /*$$scope*/ 16384) {
    				tooltip_changes.$$scope = { dirty, ctx };
    			}

    			tooltip.$set(tooltip_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(tooltip.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(tooltip.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if_block.d();
    			destroy_component(tooltip);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function msToTime(s) {
    	// Pad to 2 or 3 digits, default is 2
    	function pad(n, z) {
    		z = z || 2;
    		return ("00" + n).slice(-z);
    	}

    	var ms = s % 1000;
    	s = (s - ms) / 1000;
    	var secs = s % 60;
    	s = (s - secs) / 60;
    	var mins = s % 60;
    	var hrs = (s - mins) / 60;
    	return pad(hrs) + ":" + pad(mins) + ":" + pad(secs) + "." + pad(Math.round(ms), 3);
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("SubTimer", slots, []);
    	const dispatch = createEventDispatcher();
    	let { activated = false } = $$props;
    	let { ms = 0 } = $$props; // can be a float
    	let { kill = false } = $$props;
    	let { displayAreYouSure = false } = $$props;
    	let { name = "" } = $$props;
    	let { index = 0 } = $$props;

    	function divDelete() {
    		dispatch("divdelete", {
    			ms,
    			index,
    			killFunc: () => {
    				$$invalidate(1, kill = true);
    			}
    		});
    	}

    	let tickerHandle = 0;
    	const writable_props = ["activated", "ms", "kill", "displayAreYouSure", "name", "index"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<SubTimer> was created with unknown prop '${key}'`);
    	});

    	function input_input_handler() {
    		name = this.value;
    		$$invalidate(2, name);
    	}

    	const click_handler = () => {
    		$$invalidate(0, activated = false);
    	};

    	const click_handler_1 = () => {
    		$$invalidate(0, activated = true);
    	};

    	const click_handler_2 = () => {
    		$$invalidate(1, kill = true);
    	};

    	$$self.$$set = $$props => {
    		if ("activated" in $$props) $$invalidate(0, activated = $$props.activated);
    		if ("ms" in $$props) $$invalidate(5, ms = $$props.ms);
    		if ("kill" in $$props) $$invalidate(1, kill = $$props.kill);
    		if ("displayAreYouSure" in $$props) $$invalidate(6, displayAreYouSure = $$props.displayAreYouSure);
    		if ("name" in $$props) $$invalidate(2, name = $$props.name);
    		if ("index" in $$props) $$invalidate(7, index = $$props.index);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		Tooltip,
    		dispatch,
    		activated,
    		ms,
    		kill,
    		displayAreYouSure,
    		name,
    		index,
    		msToTime,
    		divDelete,
    		tickerHandle,
    		displaySeconds
    	});

    	$$self.$inject_state = $$props => {
    		if ("activated" in $$props) $$invalidate(0, activated = $$props.activated);
    		if ("ms" in $$props) $$invalidate(5, ms = $$props.ms);
    		if ("kill" in $$props) $$invalidate(1, kill = $$props.kill);
    		if ("displayAreYouSure" in $$props) $$invalidate(6, displayAreYouSure = $$props.displayAreYouSure);
    		if ("name" in $$props) $$invalidate(2, name = $$props.name);
    		if ("index" in $$props) $$invalidate(7, index = $$props.index);
    		if ("tickerHandle" in $$props) tickerHandle = $$props.tickerHandle;
    		if ("displaySeconds" in $$props) $$invalidate(3, displaySeconds = $$props.displaySeconds);
    	};

    	let displaySeconds;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*ms*/ 32) {
    			 $$invalidate(3, displaySeconds = msToTime(ms));
    		}
    	};

    	return [
    		activated,
    		kill,
    		name,
    		displaySeconds,
    		divDelete,
    		ms,
    		displayAreYouSure,
    		index,
    		input_input_handler,
    		click_handler,
    		click_handler_1,
    		click_handler_2
    	];
    }

    class SubTimer extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {
    			activated: 0,
    			ms: 5,
    			kill: 1,
    			displayAreYouSure: 6,
    			name: 2,
    			index: 7
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SubTimer",
    			options,
    			id: create_fragment$1.name
    		});
    	}

    	get activated() {
    		throw new Error("<SubTimer>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set activated(value) {
    		throw new Error("<SubTimer>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get ms() {
    		throw new Error("<SubTimer>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set ms(value) {
    		throw new Error("<SubTimer>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get kill() {
    		throw new Error("<SubTimer>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set kill(value) {
    		throw new Error("<SubTimer>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get displayAreYouSure() {
    		throw new Error("<SubTimer>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set displayAreYouSure(value) {
    		throw new Error("<SubTimer>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get name() {
    		throw new Error("<SubTimer>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<SubTimer>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get index() {
    		throw new Error("<SubTimer>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set index(value) {
    		throw new Error("<SubTimer>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/TimerCard.svelte generated by Svelte v3.31.0 */

    const { console: console_1 } = globals;
    const file$2 = "src/TimerCard.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[12] = list[i];
    	child_ctx[13] = list;
    	child_ctx[14] = i;
    	return child_ctx;
    }

    // (139:4) {:else}
    function create_else_block$2(ctx) {
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Pause All";
    			add_location(button, file$2, 139, 8, 3850);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*deactivateAll*/ ctx[4], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$2.name,
    		type: "else",
    		source: "(139:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (137:4) {#if pause}
    function create_if_block$2(ctx) {
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Start All";
    			add_location(button, file$2, 137, 8, 3780);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*activateAll*/ ctx[5], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(137:4) {#if pause}",
    		ctx
    	});

    	return block;
    }

    // (146:8) {#each subTimersProps as props}
    function create_each_block(ctx) {
    	let subtimer;
    	let updating_activated;
    	let updating_kill;
    	let updating_name;
    	let current;

    	function subtimer_activated_binding(value) {
    		/*subtimer_activated_binding*/ ctx[8].call(null, value, /*props*/ ctx[12]);
    	}

    	function subtimer_kill_binding(value) {
    		/*subtimer_kill_binding*/ ctx[9].call(null, value, /*props*/ ctx[12]);
    	}

    	function subtimer_name_binding(value) {
    		/*subtimer_name_binding*/ ctx[10].call(null, value, /*props*/ ctx[12]);
    	}

    	let subtimer_props = {
    		ms: /*props*/ ctx[12].ms,
    		displayAreYouSure: /*props*/ ctx[12].displayAreYouSure,
    		index: /*props*/ ctx[12].index
    	};

    	if (/*props*/ ctx[12].activated !== void 0) {
    		subtimer_props.activated = /*props*/ ctx[12].activated;
    	}

    	if (/*props*/ ctx[12].kill !== void 0) {
    		subtimer_props.kill = /*props*/ ctx[12].kill;
    	}

    	if (/*props*/ ctx[12].name !== void 0) {
    		subtimer_props.name = /*props*/ ctx[12].name;
    	}

    	subtimer = new SubTimer({ props: subtimer_props, $$inline: true });
    	binding_callbacks.push(() => bind(subtimer, "activated", subtimer_activated_binding));
    	binding_callbacks.push(() => bind(subtimer, "kill", subtimer_kill_binding));
    	binding_callbacks.push(() => bind(subtimer, "name", subtimer_name_binding));
    	subtimer.$on("divdelete", /*handleDivDelete*/ ctx[6]);

    	const block = {
    		c: function create() {
    			create_component(subtimer.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(subtimer, target, anchor);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const subtimer_changes = {};
    			if (dirty & /*subTimersProps*/ 2) subtimer_changes.ms = /*props*/ ctx[12].ms;
    			if (dirty & /*subTimersProps*/ 2) subtimer_changes.displayAreYouSure = /*props*/ ctx[12].displayAreYouSure;
    			if (dirty & /*subTimersProps*/ 2) subtimer_changes.index = /*props*/ ctx[12].index;

    			if (!updating_activated && dirty & /*subTimersProps*/ 2) {
    				updating_activated = true;
    				subtimer_changes.activated = /*props*/ ctx[12].activated;
    				add_flush_callback(() => updating_activated = false);
    			}

    			if (!updating_kill && dirty & /*subTimersProps*/ 2) {
    				updating_kill = true;
    				subtimer_changes.kill = /*props*/ ctx[12].kill;
    				add_flush_callback(() => updating_kill = false);
    			}

    			if (!updating_name && dirty & /*subTimersProps*/ 2) {
    				updating_name = true;
    				subtimer_changes.name = /*props*/ ctx[12].name;
    				add_flush_callback(() => updating_name = false);
    			}

    			subtimer.$set(subtimer_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(subtimer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(subtimer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(subtimer, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(146:8) {#each subTimersProps as props}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let div;
    	let input;
    	let t0;
    	let t1;
    	let button0;
    	let t3;
    	let h2;
    	let t4;
    	let t5;
    	let button1;
    	let t7;
    	let current;
    	let mounted;
    	let dispose;

    	function select_block_type(ctx, dirty) {
    		if (/*pause*/ ctx[2]) return create_if_block$2;
    		return create_else_block$2;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);
    	let each_value = /*subTimersProps*/ ctx[1];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			div = element("div");
    			input = element("input");
    			t0 = space();
    			if_block.c();
    			t1 = space();
    			button0 = element("button");
    			button0.textContent = "Delete Group";
    			t3 = space();
    			h2 = element("h2");
    			t4 = text(/*displayTime*/ ctx[0]);
    			t5 = space();
    			button1 = element("button");
    			button1.textContent = "Add Timer";
    			t7 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(input, "type", "text");
    			attr_dev(input, "placeholder", "Group Name");
    			add_location(input, file$2, 134, 4, 3710);
    			add_location(button0, file$2, 141, 4, 3916);
    			add_location(h2, file$2, 143, 4, 3978);
    			add_location(button1, file$2, 144, 4, 4005);
    			attr_dev(div, "class", "svelte-1nlng1y");
    			add_location(div, file$2, 133, 0, 3700);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, input);
    			append_dev(div, t0);
    			if_block.m(div, null);
    			append_dev(div, t1);
    			append_dev(div, button0);
    			append_dev(div, t3);
    			append_dev(div, h2);
    			append_dev(h2, t4);
    			append_dev(div, t5);
    			append_dev(div, button1);
    			append_dev(div, t7);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", /*fireDeleteEvent*/ ctx[7], false, false, false),
    					listen_dev(button1, "click", /*addTimer*/ ctx[3], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(div, t1);
    				}
    			}

    			if (!current || dirty & /*displayTime*/ 1) set_data_dev(t4, /*displayTime*/ ctx[0]);

    			if (dirty & /*subTimersProps, handleDivDelete*/ 66) {
    				each_value = /*subTimersProps*/ ctx[1];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if_block.d();
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function msToTime$1(s) {
    	// Pad to 2 or 3 digits, default is 2
    	function pad(n, z) {
    		z = z || 2;
    		return ("00" + n).slice(-z);
    	}

    	var ms = s % 1000;
    	s = (s - ms) / 1000;
    	var secs = s % 60;
    	s = (s - secs) / 60;
    	var mins = s % 60;
    	var hrs = (s - mins) / 60;
    	return pad(hrs) + ":" + pad(mins) + ":" + pad(secs) + "." + pad(Math.round(ms), 3);
    }

    // Subtracts a proportional amount from each timer and returns what the new timer should be set to.
    function subtractProportional(timersProps) {
    	let totalTime = 0;

    	timersProps.forEach(props => {
    		totalTime += props.ms;
    	});

    	let newTimerSeconds = 0;

    	timersProps.forEach(timer => {
    		if (timersProps.length === 1) {
    			timer.ms = timer.ms / 2;
    			newTimerSeconds = timer.ms / 2;
    			return;
    		}

    		let secondsProportion = timer.ms / totalTime;
    		if (isNaN(secondsProportion)) secondsProportion = 0;
    		let subtractBy = Math.ceil(secondsProportion * timer.ms);
    		timer.ms = timer.ms - subtractBy;
    		newTimerSeconds += subtractBy;
    	});

    	newTimerSeconds = newTimerSeconds / 2;

    	// put half of newTimerSeconds back amongst the incumbent timers
    	timersProps.forEach(timer => {
    		timer.ms = timer.ms + (timersProps.length + 1) / 2;
    	});

    	return newTimerSeconds;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("TimerCard", slots, []);
    	const dispatch = createEventDispatcher();
    	let displayTime = 0;
    	let subTimersProps = [];
    	let pause = false;

    	setInterval(
    		() => {
    			subTimersProps.forEach((timerProps, i) => {
    				if (timerProps.kill) {
    					subTimersProps.splice(i, 1);
    				}
    			});

    			let activatedAmt = 0;

    			subTimersProps.forEach(timerProps => {
    				if (timerProps.activated) {
    					activatedAmt++;
    				}
    			});

    			subTimersProps.forEach(timerProps => {
    				if (timerProps.activated) {
    					timerProps.ms += 25 / activatedAmt;
    				}
    			});

    			let sum = 0;

    			subTimersProps.forEach(timerProps => {
    				sum += timerProps.ms;
    			});

    			$$invalidate(0, displayTime = msToTime$1(sum));
    			$$invalidate(1, subTimersProps);
    		},
    		25
    	);

    	function addTimer() {
    		let newSeconds = subtractProportional(subTimersProps);

    		let props = {
    			activated: true,
    			ms: newSeconds,
    			kill: false,
    			displayAreYouSure: false,
    			name: "",
    			index: subTimersProps.length
    		};

    		$$invalidate(1, subTimersProps = [...subTimersProps, props]);
    	}

    	function deactivateAll() {
    		subTimersProps.forEach(timerProps => {
    			timerProps.activated = false;
    			$$invalidate(2, pause = true);
    		});
    	}

    	function activateAll() {
    		subTimersProps.forEach(timerProps => {
    			$$invalidate(2, pause = false);
    			timerProps.activated = true;
    		});
    	}

    	function handleDivDelete(e) {
    		let divAmount = e.detail.ms / (subTimersProps.length - 1);
    		console.log("div del detected", subTimersProps.length - 1, { divAmount }, e.detail.ms, e.detail.ms / subTimersProps.length - 1);

    		subTimersProps.forEach((timerProps, i) => {
    			if (i === e.detail.index) return;
    			timerProps.ms += divAmount;
    		});

    		e.detail.killFunc();
    		$$invalidate(1, subTimersProps);
    	}

    	function fireDeleteEvent() {
    		dispatch("deleteMe");
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<TimerCard> was created with unknown prop '${key}'`);
    	});

    	function subtimer_activated_binding(value, props) {
    		props.activated = value;
    		$$invalidate(1, subTimersProps);
    	}

    	function subtimer_kill_binding(value, props) {
    		props.kill = value;
    		$$invalidate(1, subTimersProps);
    	}

    	function subtimer_name_binding(value, props) {
    		props.name = value;
    		$$invalidate(1, subTimersProps);
    	}

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		dispatch,
    		SubTimer,
    		displayTime,
    		subTimersProps,
    		pause,
    		msToTime: msToTime$1,
    		addTimer,
    		subtractProportional,
    		deactivateAll,
    		activateAll,
    		handleDivDelete,
    		fireDeleteEvent
    	});

    	$$self.$inject_state = $$props => {
    		if ("displayTime" in $$props) $$invalidate(0, displayTime = $$props.displayTime);
    		if ("subTimersProps" in $$props) $$invalidate(1, subTimersProps = $$props.subTimersProps);
    		if ("pause" in $$props) $$invalidate(2, pause = $$props.pause);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		displayTime,
    		subTimersProps,
    		pause,
    		addTimer,
    		deactivateAll,
    		activateAll,
    		handleDivDelete,
    		fireDeleteEvent,
    		subtimer_activated_binding,
    		subtimer_kill_binding,
    		subtimer_name_binding
    	];
    }

    class TimerCard extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "TimerCard",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src/App.svelte generated by Svelte v3.31.0 */
    const file$3 = "src/App.svelte";

    function create_fragment$3(ctx) {
    	let main;
    	let timercard;
    	let t0;
    	let br0;
    	let t1;
    	let br1;
    	let t2;
    	let subtimer;
    	let current;
    	timercard = new TimerCard({ $$inline: true });
    	subtimer = new SubTimer({ $$inline: true });

    	const block = {
    		c: function create() {
    			main = element("main");
    			create_component(timercard.$$.fragment);
    			t0 = space();
    			br0 = element("br");
    			t1 = space();
    			br1 = element("br");
    			t2 = space();
    			create_component(subtimer.$$.fragment);
    			add_location(br0, file$3, 9, 1, 160);
    			add_location(br1, file$3, 10, 1, 166);
    			add_location(main, file$3, 7, 0, 127);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			mount_component(timercard, main, null);
    			append_dev(main, t0);
    			append_dev(main, br0);
    			append_dev(main, t1);
    			append_dev(main, br1);
    			append_dev(main, t2);
    			mount_component(subtimer, main, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(timercard.$$.fragment, local);
    			transition_in(subtimer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(timercard.$$.fragment, local);
    			transition_out(subtimer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(timercard);
    			destroy_component(subtimer);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);
    	let { name } = $$props;
    	const writable_props = ["name"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("name" in $$props) $$invalidate(0, name = $$props.name);
    	};

    	$$self.$capture_state = () => ({ SubTimer, TimerCard, name });

    	$$self.$inject_state = $$props => {
    		if ("name" in $$props) $$invalidate(0, name = $$props.name);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [name];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { name: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$3.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*name*/ ctx[0] === undefined && !("name" in props)) {
    			console.warn("<App> was created without expected prop 'name'");
    		}
    	}

    	get name() {
    		throw new Error("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const app = new App({
    	target: document.body,
    	props: {
    		name: 'world'
    	}
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
