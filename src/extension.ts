/* extension.js
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
 */

import GLib from 'gi://GLib'
import GObject from 'gi://GObject';
import Gio from 'gi://Gio'
import St from 'gi://St';
import Clutter from 'gi://Clutter';

import { Extension, gettext as _ } from 'resource:///org/gnome/shell/extensions/extension.js';
import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js';
import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js';
import * as ModalDialog from 'resource:///org/gnome/shell/ui/modalDialog.js';

import * as Main from 'resource:///org/gnome/shell/ui/main.js';

const TITLE = 'Firefox Profile Applet';
const LOGID = 'firebox-applet';
const ICON_SIZE = 22;
const DEBUG = true;

let sourceId3 = null;

class FireforProfileAppletBtn extends PanelMenu.Button {
  private _textdecoder: TextDecoder;
  private _menuitems: PopupMenu.PopupMenuItem[];
  private _tmpItem: PopupMenu.PopupMenuItem;

  static {
    GObject.registerClass(this);
  }

  constructor(path: string) {
    super(0.0, TITLE);

    this._textdecoder = new TextDecoder();
    this._menuitems = [];
    const icon_path = path + '/icons/firefox.svg';
    this._log(icon_path);
    let gicon = Gio.icon_new_for_string(icon_path);
    let icon = new St.Icon({ gicon: gicon, icon_size: ICON_SIZE });
    this.add_child(icon);

    this._tmpItem = new PopupMenu.PopupMenuItem('...');
    this.menu.addMenuItem(this._tmpItem);
    sourceId3 = GLib.timeout_add_seconds(GLib.PRIORITY_DEFAULT, 3, this._populateMenu.bind(this));
  }

  _startProfile(name: string) {
    GLib.spawn_command_line_async('firefox -no-remote -P ' + name);
  };

  _createProfile(name: string) {
    GLib.spawn_command_line_async('firefox -CreateProfile ' + name);
  }

  _parseProfilesList(lines: string) {
    if (lines.length !== 0) {
      return lines.toString().split('\n');
    }
    return [];
  };

  _createProfileMenu() {
    let profileDialog = new ModalDialog.ModalDialog({
      styleClass: 'profile-dialog',
    });

    let entry = new St.Entry({
      hint_text: 'Unique Firefox profile name',
      input_purpose: Clutter.InputContentPurpose.ALPHA,
    });

    profileDialog.setButtons([{
      label: "OK",
      action: () => {
        let profileName = entry.get_text();
        this._log('Input: ' + profileName);
        profileDialog.destroy();
        if (profileName) {
          this._createProfile(profileName);
        }
      },
      key: Clutter.Enter,
    }, {
      label: 'Cancel',
      action: () => {
        this._log('Create profile canceled');
        profileDialog.destroy();
      },
      key: Clutter.Escape,
    }]);

    let box = new St.BoxLayout({ vertical: true });
    profileDialog.contentLayout.add_child(box);

    box.add_child(new St.Label({
      text: 'New firefox profile name:',
    }));
    box.add_child(entry);

    profileDialog.open();
  }

  _startPrivateWindow() {
    GLib.spawn_command_line_async('firefox  --private-window' );
  }

  _populateMenu() {
    this._menuitems = [];
    this.menu.removeAll();

    let lines: string;
    try {
      const homeDir = GLib.get_home_dir();
      let cmd = 'awk -F = \'$1 == "Name" { print $2 }\' ' +
        homeDir + '/.mozilla/firefox/profiles.ini';
      this._log('Run \'' + cmd + '\'');
      let result = GLib.spawn_command_line_sync(cmd);
      if (result[0]) {
        lines = this._textdecoder.decode(result[1]);
      } else {
        this._log('Failed to execute command');
        lines = this._textdecoder.decode(result[2]);
        this._log(lines);
        return;
      }
    }
    catch (err) {
      this._log(err);
      Main.notifyError(TITLE + ': ' + err);
      return;
    }

    let profiles = this._parseProfilesList(lines);

    if (profiles.length !== 0) {
      for (let i = 0; i < profiles.length; i++) {
        if (profiles[i].length == 0) {
          continue;
        }

        this._log('Processing profile: ' + profiles[i]);
        let menuitem = new PopupMenu.PopupMenuItem(profiles[i]);
        menuitem.connect('activate', this._startProfile.bind(this, profiles[i]));
        this.menu.addMenuItem(menuitem);
        this._menuitems.push(menuitem);
      }
    }

    this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());

    let menuitemRefresh = new PopupMenu.PopupMenuItem('Refresh');
    menuitemRefresh.connect('activate', this._populateMenu.bind(this));
    this.menu.addMenuItem(menuitemRefresh);

    let menuitemPrivateWindow = new PopupMenu.PopupMenuItem('Private Window');
    menuitemPrivateWindow.connect('activate', this._startPrivateWindow.bind(this));
    this.menu.addMenuItem(menuitemPrivateWindow);

    let menuitemCreateProfile = new PopupMenu.PopupMenuItem('Create Profile');
    menuitemCreateProfile.connect('activate', this._createProfileMenu.bind(this));
    this.menu.addMenuItem(menuitemCreateProfile);

    return false;
  }

  _log(text: string) {
    if (DEBUG) {
      console.log(LOGID, text);
    }
  }
}

export default class FirefoxProfileApplet extends Extension {
  enable() {
    this._ffoxapplet = new FireforProfileAppletBtn(this.path);
    Main.panel.addToStatusArea(TITLE, this._ffoxapplet);
  }

  disable() {
    if (sourceId3) {
      GLib.Source.remove(sourceId3);
      sourceId3 = null;
    }

    this._ffoxapplet.destroy();
  }
}
