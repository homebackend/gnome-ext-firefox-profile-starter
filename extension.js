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

import {Extension, gettext as _} from 'resource:///org/gnome/shell/extensions/extension.js';
import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js';
import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js';

import * as Main from 'resource:///org/gnome/shell/ui/main.js';

const TITLE = 'Firefox Profile Applet';
const LOGID   = 'firebox-applet';
const ICON_SIZE    = 22;
const DEBUG        = true;

let sourceId3 = null;

class FireforProfileAppletBtn extends PanelMenu.Button
{
    static {
        GObject.registerClass(this);
    }

    constructor( path )
    {
        super( 0.0, TITLE );

        this._textdecoder = new TextDecoder();
        this._populated = false;
        this._menuitems = [];
        let gicon = Gio.icon_new_for_string( path + '/icons/firefox.svg' );
        let icon = new St.Icon( { gicon: gicon, icon_size: ICON_SIZE } );
        this.add_child( icon );

        this._tmpItem = new PopupMenu.PopupMenuItem( '...' );
        this.menu.addMenuItem( this._tmpItem );
        sourceId3 = GLib.timeout_add_seconds( GLib.PRIORITY_DEFAULT, 3, this._populateMenu.bind(this) );
        //this._populateMenu();
    }

    _startProfile( name ) {
        GLib.spawn_command_line_async( 'firefox -no-remote -P ' + name );
    };

    _parseProfilesList( lines )
    {
        if ( lines.length !== 0 )
        {
            return lines.toString().split('\n');
        }
        return [];
    };

    _populateMenu()
    {
        this._menuitems = [];
        this.menu.removeAll();

        let lines;
        try
        {
            const homeDir = GLib.get_home_dir();
            let cmd = 'awk -F = \'$1 == "Name" { print $2 }\' ' + 
              homeDir + '/.mozilla/firefox/profiles.ini';
            this._log( 'Run \'' + cmd + '\'' );
            let result = GLib.spawn_command_line_sync( cmd );
            if (result[0]) {
              lines = this._textdecoder.decode( result[1] );
            } else {
              this._log('Failed to execute command');
              lines = this._textdecoder.decode( result[2] );
              this._log(lines);
              return;
            }
        }
        catch (err) {
            this._log( err );
            Main.notifyError( TITLE + ': ' + err );
            return;
        }

        let profiles = this._parseProfilesList( lines );

        if ( profiles.length !== 0 )
        {
            for ( let i = 0; i < profiles.length; i++ )
            {
                if (profiles[i].length == 0) {
                    continue;
                }
                
                this._log('Processing profile: ' + profiles[i]);
                let menuitem = new PopupMenu.PopupMenuItem( profiles[i] );
                menuitem.connect( 'activate', this._startProfile.bind(this, profiles[i]) );
                this.menu.addMenuItem(menuitem);
                this._menuitems.push(menuitem);
            }
        }

        this.menu.addMenuItem( new PopupMenu.PopupSeparatorMenuItem() );

        let menuitemRefresh = new PopupMenu.PopupMenuItem( 'Refresh' );
        menuitemRefresh.connect( 'activate', this._populateMenu.bind(this) );
        this.menu.addMenuItem( menuitemRefresh );

        this._populated = true;

        return false;
    }

    _log( text ) {
        if ( DEBUG ) {
            console.log( LOGID, text );
        }
    }
}

export default class FirefoxProfileApplet extends Extension
{
    enable() {
        this._ffoxapplet = new FireforProfileAppletBtn( this.path );
        Main.panel.addToStatusArea( TITLE, this._ffoxapplet );
    }

    disable()
    {
        if ( sourceId3 ) {
            GLib.Source.remove( sourceId3 );
            sourceId3 = null;
        }
    
        this._ffoxapplet.destroy();
        this._ffoxapplet = null;
    }
}

