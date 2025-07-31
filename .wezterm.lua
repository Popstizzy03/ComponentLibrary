-- wezterm.lua - Professional Terminal Configuration
local wezterm = require("wezterm")
local act = wezterm.action
local config = {}

-- Use config builder for better error messages
if wezterm.config_builder then
	config = wezterm.config_builder()
end

-- ===============================
-- APPEARANCE & THEME
-- ===============================

-- Color scheme - Tokyo Night for professional look
-- config.color_scheme = "Tokyo Night"

-- Alternative professional themes to try:
-- config.color_scheme = "Catppuccin Mocha"
-- config.color_scheme = "One Dark (Gogh)"
 config.color_scheme = "Dracula"

-- Font configuration - Optimized for coding
config.font = wezterm.font_with_fallback({
	{ family = "JetBrains Mono", weight = "Regular" },
	{ family = "Fira Code", weight = "Regular" },
	{ family = "SF Mono", weight = "Regular" },
})
config.font_size = 11.0
config.line_height = 1.0
config.cell_width = 1.0

-- Window appearance
config.window_background_opacity = 1.0
config.text_background_opacity = 1.0
config.window_decorations = "TITLE | RESIZE | MACOS_FORCE_ENABLE_SHADOW"
config.window_padding = {
	left = 1,
	right = 1,
	top = 1,
	bottom = 1,
}

-- Cursor configuration
config.default_cursor_style = "BlinkingBlock"
config.cursor_blink_rate = 500
config.cursor_thickness = 2

-- ===============================
-- WINDOW FRAME & TABS
-- ===============================

-- Custom window frame colors
config.window_frame = {
	font = wezterm.font({ family = "SF Pro Display", weight = "DemiBold" }),
	font_size = 12.0,
	active_titlebar_bg = "#1a1b26",
	inactive_titlebar_bg = "#16161e",
	active_titlebar_fg = "#c0caf5",
	inactive_titlebar_fg = "#565f89",
}

-- Tab bar configuration
config.enable_tab_bar = true
config.tab_bar_at_bottom = true
config.use_fancy_tab_bar = true
config.show_tab_index_in_tab_bar = false
config.hide_tab_bar_if_only_one_tab = true
config.tab_max_width = 32

-- Custom tab styling
config.colors = {
	tab_bar = {
		background = "#1a1b26",
		active_tab = {
			bg_color = "#7aa2f7",
			fg_color = "#16161e",
			intensity = "Bold",
		},
		inactive_tab = {
			bg_color = "#292e42",
			fg_color = "#565f89",
		},
		inactive_tab_hover = {
			bg_color = "#3b4261",
			fg_color = "#c0caf5",
		},
		new_tab = {
			bg_color = "#1a1b26",
			fg_color = "#565f89",
		},
		new_tab_hover = {
			bg_color = "#292e42",
			fg_color = "#c0caf5",
		},
	},
}

-- ===============================
-- WINDOW SIZING & BEHAVIOR
-- ===============================

config.initial_cols = 135
config.initial_rows = 35
config.adjust_window_size_when_changing_font_size = false
config.window_close_confirmation = "NeverPrompt"
config.native_macos_fullscreen_mode = false

-- ===============================
-- ADVANCED FEATURES
-- ===============================

-- Scrollback and history
config.scrollback_lines = 50000
config.enable_scroll_bar = true
config.min_scroll_bar_height = "3cell"

-- Bell configuration
config.audible_bell = "Disabled"
config.visual_bell = {
	fade_in_function = "EaseIn",
	fade_in_duration_ms = 150,
	fade_out_function = "EaseOut",
	fade_out_duration_ms = 150,
}

-- Performance optimizations
config.max_fps = 144
config.animation_fps = 60
config.front_end = "WebGpu"

-- Advanced terminal features
config.enable_kitty_keyboard = true
config.enable_kitty_graphics = true
config.automatically_reload_config = true

-- ===============================
-- KEY BINDINGS
-- ===============================

config.keys = {
	-- ===== Clipboard Operations =====
	{ key = "c", mods = "CTRL|SHIFT", action = act.CopyTo("Clipboard") },
	{ key = "v", mods = "CTRL|SHIFT", action = act.PasteFrom("Clipboard") },
	{ key = "Insert", mods = "SHIFT", action = act.PasteFrom("Clipboard") },

	-- ===== Pane Management =====
	{ key = "|", mods = "CTRL|SHIFT", action = act.SplitHorizontal({ domain = "CurrentPaneDomain" }) },
	{ key = "\\", mods = "CTRL", action = act.SplitHorizontal({ domain = "CurrentPaneDomain" }) },
	{ key = "_", mods = "CTRL|SHIFT", action = act.SplitVertical({ domain = "CurrentPaneDomain" }) },
	{ key = "-", mods = "CTRL", action = act.SplitVertical({ domain = "CurrentPaneDomain" }) },

	-- Pane navigation (Vim-style)
	{ key = "h", mods = "CTRL|SHIFT", action = act.ActivatePaneDirection("Left") },
	{ key = "j", mods = "CTRL|SHIFT", action = act.ActivatePaneDirection("Down") },
	{ key = "k", mods = "CTRL|SHIFT", action = act.ActivatePaneDirection("Up") },
	{ key = "l", mods = "CTRL|SHIFT", action = act.ActivatePaneDirection("Right") },

	-- Pane resizing
	{ key = "LeftArrow", mods = "CTRL|SHIFT", action = act.AdjustPaneSize({ "Left", 5 }) },
	{ key = "RightArrow", mods = "CTRL|SHIFT", action = act.AdjustPaneSize({ "Right", 5 }) },
	{ key = "UpArrow", mods = "CTRL|SHIFT", action = act.AdjustPaneSize({ "Up", 5 }) },
	{ key = "DownArrow", mods = "CTRL|SHIFT", action = act.AdjustPaneSize({ "Down", 5 }) },

	-- Close pane
	{ key = "w", mods = "CTRL|SHIFT", action = act.CloseCurrentPane({ confirm = false }) },
	{ key = "q", mods = "CTRL|SHIFT", action = act.CloseCurrentPane({ confirm = true }) },

	-- ===== Tab Management =====
	{ key = "t", mods = "CTRL|SHIFT", action = act.SpawnTab("CurrentPaneDomain") },
	{ key = "Tab", mods = "CTRL", action = act.ActivateTabRelative(1) },
	{ key = "Tab", mods = "CTRL|SHIFT", action = act.ActivateTabRelative(-1) },

	-- Tab navigation by number
	{ key = "1", mods = "CTRL", action = act.ActivateTab(0) },
	{ key = "2", mods = "CTRL", action = act.ActivateTab(1) },
	{ key = "3", mods = "CTRL", action = act.ActivateTab(2) },
	{ key = "4", mods = "CTRL", action = act.ActivateTab(3) },
	{ key = "5", mods = "CTRL", action = act.ActivateTab(4) },
	{ key = "6", mods = "CTRL", action = act.ActivateTab(5) },
	{ key = "7", mods = "CTRL", action = act.ActivateTab(6) },
	{ key = "8", mods = "CTRL", action = act.ActivateTab(7) },
	{ key = "9", mods = "CTRL", action = act.ActivateTab(8) },

	-- ===== Font Size Control =====
	{ key = "=", mods = "CTRL", action = act.IncreaseFontSize },
	{ key = "+", mods = "CTRL|SHIFT", action = act.IncreaseFontSize },
	{ key = "-", mods = "CTRL", action = act.DecreaseFontSize },
	{ key = "0", mods = "CTRL", action = act.ResetFontSize },

	-- ===== Window Management =====
	{ key = "n", mods = "CTRL|SHIFT", action = act.SpawnWindow },
	{ key = "F11", action = act.ToggleFullScreen },
	{ key = "m", mods = "CTRL|SHIFT", action = act.Hide },

	-- ===== Search & Find =====
	{ key = "f", mods = "CTRL|SHIFT", action = act.Search({ CaseInSensitiveString = "" }) },
	{ key = "F3", action = act.Search({ CaseSensitiveString = "" }) },

	-- ===== Scrolling =====
	{ key = "PageUp", mods = "SHIFT", action = act.ScrollByPage(-1) },
	{ key = "PageDown", mods = "SHIFT", action = act.ScrollByPage(1) },
	{ key = "Home", mods = "SHIFT", action = act.ScrollToTop },
	{ key = "End", mods = "SHIFT", action = act.ScrollToBottom },

	-- ===== Quick Actions =====
	{ key = "r", mods = "CTRL|SHIFT", action = act.ReloadConfiguration },
	{
		key = "u",
		mods = "CTRL|SHIFT",
		action = act.CharSelect({ copy_on_select = true, copy_to = "ClipboardAndPrimarySelection" }),
	},

	-- Clear scrollback
	{ key = "k", mods = "CTRL|CMD", action = act.ClearScrollback("ScrollbackAndViewport") },

	-- Quick launcher
	{ key = "p", mods = "CTRL|SHIFT", action = act.ActivateCommandPalette },
}

-- ===============================
-- MOUSE CONFIGURATION
-- ===============================

config.mouse_bindings = {
	-- Copy on select
	{
		event = { Up = { streak = 1, button = "Left" } },
		mods = "NONE",
		action = act.CompleteSelection("ClipboardAndPrimarySelection"),
	},

	-- Right click context menu
	{
		event = { Down = { streak = 1, button = "Right" } },
		mods = "NONE",
		action = wezterm.action_callback(function(window, pane)
			local has_selection = window:get_selection_text_for_pane(pane) ~= ""
			if has_selection then
				window:perform_action(act.CopyTo("ClipboardAndPrimarySelection"), pane)
				window:perform_action(act.ClearSelection, pane)
			else
				window:perform_action(act.PasteFrom("Clipboard"), pane)
			end
		end),
	},

	-- Middle click to paste
	{
		event = { Down = { streak = 1, button = "Middle" } },
		mods = "NONE",
		action = act.PasteFrom("Clipboard"),
	},

	-- Ctrl+Click to open URLs
	{
		event = { Down = { streak = 1, button = "Left" } },
		mods = "CTRL",
		action = act.OpenLinkAtMouseCursor,
	},
}

-- ===============================
-- HYPERLINK RULES
-- ===============================

config.hyperlink_rules = {
	-- HTTP/HTTPS URLs
	{
		regex = "\\b\\w+://[\\w.-]+\\.[a-z]{2,15}\\S*\\b",
		format = "$0",
	},
	-- Git URLs
	{
		regex = "\\bgit@([\\w.-]+):([\\w./-]+)\\.git\\b",
		format = "https://$1/$2",
	},
	-- File paths (Unix-style)
	{
		regex = "\\b/[\\w./-]+\\b",
		format = "file://$0",
	},
	-- Email addresses
	{
		regex = "\\b\\w+@[\\w.-]+\\.[a-z]{2,15}\\b",
		format = "mailto:$0",
	},
}

-- ===============================
-- WORKSPACE & SESSION MANAGEMENT
-- ===============================

-- Custom tab titles
wezterm.on("format-tab-title", function(tab, tabs, panes, config, hover, max_width)
	local edge_background = "#1a1b26"
	local background = "#292e42"
	local foreground = "#c0caf5"

	if tab.is_active then
		background = "#7aa2f7"
		foreground = "#16161e"
	elseif hover then
		background = "#3b4261"
		foreground = "#c0caf5"
	end

	local edge_foreground = background
	local title = tab.active_pane.title

	-- Truncate title if too long
	if #title > max_width - 6 then
		title = string.sub(title, 1, max_width - 9) .. "..."
	end

	return {
		{ Background = { Color = edge_background } },
		{ Foreground = { Color = edge_foreground } },
		{ Text = " " },
		{ Background = { Color = background } },
		{ Foreground = { Color = foreground } },
		{ Text = " " .. title .. " " },
		{ Background = { Color = edge_background } },
		{ Foreground = { Color = edge_foreground } },
		{ Text = " " },
	}
end)

-- ===============================
-- ADDITIONAL CONFIGURATIONS
-- ===============================

-- Selection behavior
config.selection_word_boundary = " \t\n{}[]()\"'`.,;:"
config.use_ime = true
config.ime_preedit_rendering = "Builtin"

-- Terminal bell
config.audible_bell = "Disabled"

-- Launch menu (for Windows)
config.launch_menu = {}

-- Domain configuration for SSH hosts
config.ssh_domains = {}

-- Exit behavior
config.exit_behavior = "Close"

-- Status bar
config.status_update_interval = 1000

wezterm.on("update-right-status", function(window, pane)
	local date = wezterm.strftime("%Y-%m-%d %H:%M:%S")
	window:set_right_status(wezterm.format({
		{ Background = { Color = "#1a1b26" } },
		{ Foreground = { Color = "#565f89" } },
		{ Text = " " .. date .. " " },
	}))
end)

return config
