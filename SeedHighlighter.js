// ==UserScript==
// @name         The Seed Highlighter
// @version      1.0
// @description  Applies a gradient for torrents being seeded and torrents that have been downloaded but aren't being seeded, allows changing icon colors, and more.
// @author       dane
// @match        https://blutopia.cc/*
// @grant        GM_registerMenuCommand
// @grant        GM_addStyle
// ==/UserScript==

(function() {
    'use strict';

    const defaultConfig = {
        hideSeedingIcons: true,
        hideDownloadButton: true,
        applyOnHighlightedRowsOnly: false,
        checkInterval: 100,
        colorSeeding: '#007aff',
        colorNotSeeding: '#ffa500',
        iconSeeding: '#ffffff',
        iconNotSeeding: '#ffffff',
        iconThanks: '#ffffff',
        iconComments: '#ffffff',
        iconFreeleech: '#ffffff',
        iconDoubleUpload: '#ffffff',
        iconHighspeed: '#ffffff',
        iconSD: '#ffffff',
        iconPersonalRelease: '#ffffff',
        iconInternal: '#ffffff',
        iconBumped: '#ffffff',
        iconFeatured: '#ffffff',
        iconSticky: '#ffffff',
        guiBackgroundColor: '#363636',
        guiTextColor: '#ffffff'
    };

    function loadConfig() {
        return JSON.parse(localStorage.getItem('torrentHighlighterConfig')) || defaultConfig;
    }

    function saveConfig(config) {
        localStorage.setItem('torrentHighlighterConfig', JSON.stringify(config));
    }

    function resetToDefault() {
        config = { ...defaultConfig };
        saveConfig(config);
        location.reload();
    }

    let config = loadConfig();

    function createSettingsPanel() {
        if (document.getElementById('settings-panel')) return;

        const panel = document.createElement('div');
        panel.id = 'settings-panel';
        panel.style.position = 'fixed';
        panel.style.top = '5px';
        panel.style.right = '10px';
        panel.style.background = config.guiBackgroundColor;
        panel.style.border = '2px solid #404040';
        panel.style.padding = '15px';
        panel.style.zIndex = '1000';
        panel.style.width = '400px';
        panel.style.color = config.guiTextColor;
        panel.style.boxSizing = 'border-box';

        panel.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center;">
            <h3 style="margin: ${config.settingsTitleMargin};">Settings</h3>
            <button id="closeSettings" style="background: none; border: none; color: ${config.guiTextColor}; font-size: 30px; padding: 0 15px; cursor: pointer;">&times;</button>
        </div>
        <div class="setting-row">
            <label><input type="checkbox" id="hideSeedingIcons"> Hide Seeding Icons</label>
        </div>
        <div class="setting-row">
            <label><input type="checkbox" id="hideDownloadButton"> Hide Download Button</label>
        </div>
        <div class="setting-row">
            <label><input type="checkbox" id="applyOnHighlightedRowsOnly"> Apply Colors on Highlighted Rows Only</label>
        </div>
        <div class="setting-row">
            <label>Check Interval (ms): <input type="number" id="checkInterval" value="${config.checkInterval}" min="10"></label>
        </div>
        <div class="setting-row">
            <label>Color Seeding: <input type="color" id="colorSeeding" value="${config.colorSeeding}" style="margin-left: 62px;"></label>
        </div>
        <div class="setting-row">
            <label>Color Not Seeding: <input type="color" id="colorNotSeeding" value="${config.colorNotSeeding}" style="margin-left: 31px;"></label>
        </div>
        <div class="setting-row">
            <label>Icon Seeding: <input type="color" id="iconSeeding" value="${config.iconSeeding}" style="margin-left: 70px;"></label>
        </div>
        <div class="setting-row">
            <label>Icon Not Seeding: <input type="color" id="iconNotSeeding" value="${config.iconNotSeeding}" style="margin-left: 39px;"></label>
        </div>
        <div class="setting-row">
            <label>Icon Thanks: <input type="color" id="iconThanks" value="${config.iconThanks}" style="margin-left: 78px;"></label>
        </div>
        <div class="setting-row">
            <label>Icon Comments: <input type="color" id="iconComments" value="${config.iconComments}" style="margin-left: 51px;"></label>
        </div>
        <div class="setting-row">
            <label>Icon Freeleech: <input type="color" id="iconFreeleech" value="${config.iconFreeleech}" style="margin-left: 60px;"></label>
        </div>
        <div class="setting-row">
            <label>Icon Double Upload: <input type="color" id="iconDoubleUpload" value="${config.iconDoubleUpload}" style="margin-left: 20px;"></label>
        </div>
        <div class="setting-row">
            <label>Icon Highspeed: <input type="color" id="iconHighspeed" value="${config.iconHighspeed}" style="margin-left: 51px;"></label>
        </div>
        <div class="setting-row">
            <label>Icon SD: <input type="color" id="iconSD" value="${config.iconSD}" style="margin-left: 107px;"></label>
        </div>
        <div class="setting-row">
            <label>Icon Personal Release: <input type="color" id="iconPersonalRelease" value="${config.iconPersonalRelease}" style="margin-left: 10px;"></label>
        </div>
        <div class="setting-row">
            <label>Icon Internal: <input type="color" id="iconInternal" value="${config.iconInternal}" style="margin-left: 73px;"></label>
        </div>
        <div class="setting-row">
            <label>Icon Bumped: <input type="color" id="iconBumped" value="${config.iconBumped}" style="margin-left: 68px;"></label>
        </div>
        <div class="setting-row">
            <label>Icon Featured: <input type="color" id="iconFeatured" value="${config.iconFeatured}" style="margin-left: 65px;"></label>
        </div>
        <div class="setting-row">
            <label>Icon Sticky: <input type="color" id="iconSticky" value="${config.iconSticky}" style="margin-left: 87px;"></label>
        </div>
        <div class="setting-row">
            <label>GUI Background Color: <input type="color" id="guiBackgroundColor" value="${config.guiBackgroundColor}" style="margin-left: 5px;"></label>
        </div>
        <div class="setting-row">
            <label>GUI Text Color: <input type="color" id="guiTextColor" value="${config.guiTextColor}" style="margin-left: 61px;"></label>
        </div>
        <div class="setting-row">
            <button id="saveSettings">Save Settings</button>
            <button id="resetSettings" style="margin-left: 20px;">Reset to Default</button>
        </div>
        `;

        document.body.appendChild(panel);

        GM_addStyle(`
            #settings-panel .setting-row {
                margin-bottom: 10px;
                display: flex;
                align-items: center;
            }
            #settings-panel label {
                margin-right: 5px;
            }
            #settings-panel button {
                margin-left: 5px;
            }
        `);

        document.getElementById('hideSeedingIcons').checked = config.hideSeedingIcons;
        document.getElementById('hideDownloadButton').checked = config.hideDownloadButton;
        document.getElementById('applyOnHighlightedRowsOnly').checked = config.applyOnHighlightedRowsOnly;
        document.getElementById('checkInterval').value = config.checkInterval;

        Object.keys(defaultConfig).filter(key => key.startsWith('color') || key.startsWith('icon')).forEach(key => {
            document.getElementById(key).value = config[key];
        });

        document.getElementById('guiBackgroundColor').value = config.guiBackgroundColor;
        document.getElementById('guiTextColor').value = config.guiTextColor;

        document.getElementById('saveSettings').addEventListener('click', () => {
            config.hideSeedingIcons = document.getElementById('hideSeedingIcons').checked;
            config.hideDownloadButton = document.getElementById('hideDownloadButton').checked;
            config.applyOnHighlightedRowsOnly = document.getElementById('applyOnHighlightedRowsOnly').checked;
            config.checkInterval = parseInt(document.getElementById('checkInterval').value, 10);

            Object.keys(defaultConfig).filter(key => key.startsWith('color') || key.startsWith('icon')).forEach(key => {
                config[key] = document.getElementById(key).value;
            });

            config.guiBackgroundColor = document.getElementById('guiBackgroundColor').value;
            config.guiTextColor = document.getElementById('guiTextColor').value;

            saveConfig(config);
            alert('Settings saved! Reloading the page to apply changes.');
            location.reload();
        });

        document.getElementById('resetSettings').addEventListener('click', () => {
            if (confirm('Are you sure you want to reset settings to default?')) {
                resetToDefault();
            }
        });

        document.getElementById('closeSettings').addEventListener('click', () => {
            document.getElementById('settings-panel').remove();
        });
    }

    GM_registerMenuCommand('Open Settings Panel', () => {
        createSettingsPanel();
    });

    function highlightRow(row, color) {
        const formatColumn = row.querySelector('td.torrent-search--list__format');
        const overviewColumn = row.querySelector('td.torrent-search--list__overview');
        const otherColumns = row.querySelectorAll('td:not(.torrent-search--list__format):not(.torrent-search--list__overview)');

        if (!row.classList.contains('highlighted')) {
            if (formatColumn) {
                formatColumn.style.setProperty('background-color', color, 'important');
                formatColumn.style.setProperty('background-image', 'none', 'important');
            }

            if (overviewColumn) {
                const gradient = `linear-gradient(to right, ${color} 0%, transparent 98%)`;
                overviewColumn.style.setProperty('background-image', gradient, 'important');
                overviewColumn.style.setProperty('background-color', 'transparent', 'important');
                overviewColumn.style.setProperty('background-repeat', 'no-repeat', 'important');
                overviewColumn.style.setProperty('background-size', '100% 100%', 'important');
            }

            otherColumns.forEach(td => {
                td.style.setProperty('background-color', 'transparent', 'important');
            });

            row.classList.add('highlighted');
        }
    }

    function toggleDownloadButton(row) {
        const downloadButton = row.querySelector('a.torrent-search--list__file');
        if (downloadButton) {
            downloadButton.style.display = config.hideDownloadButton ? 'none' : '';
        }
    }

    function toggleSeedingIcons(row) {
        const seedingIcon = row.querySelector('i.fa-arrow-circle-up');
        const notSeedingIcon = row.querySelector('i.fa-thumbs-down');

        if (config.hideSeedingIcons) {
            if (seedingIcon) seedingIcon.style.display = 'none';
            if (notSeedingIcon) notSeedingIcon.style.display = 'none';
        } else {
            if (seedingIcon) seedingIcon.style.display = '';
            if (notSeedingIcon) notSeedingIcon.style.display = '';
        }
    }

    function applyIconColors(row) {
        if (config.applyOnHighlightedRowsOnly && !row.classList.contains('highlighted')) {
            return;
        }

        const icons = {
            'i.fa-arrow-circle-up': config.iconSeeding,
            'i.fa-thumbs-down': config.iconNotSeeding,
            'i.fa-heartbeat.torrent-icons__thanks': config.iconThanks,
            'i.fa-comment-alt-lines.torrent-icons__comments': config.iconComments,
            'i.fa-star.torrent-icons__freeleech': config.iconFreeleech,
            'i.fa-chevron-double-up.torrent-icons__double-upload': config.iconDoubleUpload,
            'i.fa-standard-definition.torrent-icons__sd': config.iconSD,
            'i.fa-bolt-lightning.torrent-icons__highspeed': config.iconHighspeed,
            'i.fa-user-plus.torrent-icons__personal-release': config.iconPersonalRelease,
            'i.fa-level-up-alt.torrent-icons__bumped': config.iconBumped,
            'i.fa-award-simple.torrent-icons__featured': config.iconFeatured,
            'i.fa-thumbtack.torrent-icons__sticky': config.iconSticky,
            'i.fa-magic.torrent-icons__internal': config.iconInternal
        };

        Object.keys(icons).forEach(selector => {
            const icon = row.querySelector(selector);
            if (icon) {
                icon.style.setProperty('color', icons[selector], 'important');
            }
        });
    }

    function HighlightSeeded() {
        const torrentRows = document.querySelectorAll('tr.torrent-search--list__no-poster-row');
        torrentRows.forEach(row => {
            const seedingIcon = row.querySelector('i.fa-arrow-circle-up');
            const notSeedingIcon = row.querySelector('i.fa-thumbs-down');

            if (seedingIcon) {
                highlightRow(row, config.colorSeeding);
                toggleDownloadButton(row);
            }

            if (notSeedingIcon) {
                highlightRow(row, config.colorNotSeeding);
            }

            toggleSeedingIcons(row);
            applyIconColors(row);
        });
    }

    HighlightSeeded();

    const observer = new MutationObserver(mutationsList => {
        mutationsList.forEach(mutation => {
            if (mutation.type === 'childList') {
                HighlightSeeded();
            }
        });
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    setInterval(() => {
        HighlightSeeded();
    }, config.checkInterval);
})();