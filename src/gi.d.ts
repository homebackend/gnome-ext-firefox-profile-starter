// src/gi.d.ts
declare module 'gi://Clutter' {
  import Clutter from '@girs/clutter-1.0';
  export = Clutter;
}

declare module 'gi://Clutter?version=1.0' {
  import Clutter from '@girs/clutter-1.0';
  export = Clutter;
}

declare module 'gi://Gio' {
  import Gio from '@girs/gio-2.0';
  export = Gio;
}

declare module 'gi://Gio?version=2.0' {
  import Gio from '@girs/gio-2.0';
  export = Gio;
}

declare module 'gi://St' {
  import St from '@girs/st-1.0';
  export = St;
}

declare module 'gi://St?version=1.0' {
  import St from '@girs/st-1.0';
  export = St;
}

// Add the declaration for gi://Shell
declare module 'gi://Shell' {
  import Shell from '@girs/gnome-shell/shell';
  export = Shell;
}

declare module 'gi://Shell?version=46' {
  import Shell from '@girs/gnome-shell/shell';
  export = Shell;
}

// Add the declarations for gi://GObject
declare module 'gi://GObject' {
  import GObject from '@girs/gobject-2.0';
  export = GObject;
}

declare module 'gi://GObject?version=2.0' {
  import GObject from '@girs/gobject-2.0';
  export = GObject;
}

// Add the declarations for gi://GLib
declare module 'gi://GLib' {
  import GLib from '@girs/glib-2.0';
  export = GLib;
}

declare module 'gi://GLib?version=2.0' {
  import GLib from '@girs/glib-2.0';
  export = GLib;
}
