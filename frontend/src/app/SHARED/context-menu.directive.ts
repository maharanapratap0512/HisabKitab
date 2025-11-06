import { Directive, ElementRef, HostListener, Input, OnDestroy, Renderer2 } from '@angular/core';

/**
 * Interface for context menu item configuration
 * @property label - Display text for menu item
 * @property icon - Optional icon class (e.g., 'uil uil-edit-alt')
 * @property action - Callback function when item is clicked, receives row data
 * @property disabled - Whether item is disabled (grayed out and not clickable)
 */
export interface ContextMenuItem {
  label: string;
  icon?: string;
  action: (data?: any) => void;
  disabled?: boolean;
}

/**
 * Directive to add right-click context menu to any element
 * 
 * Usage:
 * <tr [appContextMenu]="menuItems" [contextMenuData]="rowData">
 * 
 * Features:
 * - Right-click to open menu at cursor position
 * - Auto-adjusts if menu goes off-screen
 * - Closes on click outside or scroll
 * - Fully styled with dark theme
 */

@Directive({
  selector: '[appContextMenu]'
})
export class ContextMenuDirective implements OnDestroy {

  /** Array of menu items to display */
  @Input('appContextMenu') menuItems: ContextMenuItem[] = [];

  /** Data to pass to action callbacks (typically row data) */
  @Input() contextMenuData: any;

  /** Reference to the created menu element */
  private menuElement: HTMLElement | null = null;

  /** Reference to the backdrop element */
  private backdropElement: HTMLElement | null = null;

  constructor(private renderer: Renderer2,
    private el: ElementRef) { }

  /**
 * Handles right-click event on the host element
 * Prevents default browser context menu and shows custom menu
 */
  @HostListener('contextmenu', ['$event'])
  onRightClick(event: MouseEvent) {
    console.log("right click detencted", this.menuItems, this.contextMenuData);
    
    event.preventDefault();  // Prevent browser's default context menu
    event.stopPropagation(); // Stop event from bubbling up

    this.closeMenu();  // Close any existing menu first
    this.createMenu(event.clientX, event.clientY);  // Create new menu at cursor
  }

  /**
   * Closes menu when clicking anywhere in document
   */
  @HostListener('document:click')
  onDocumentClick() {
    this.closeMenu();
  }

  /**
   * Closes menu when scrolling (menu position would be wrong)
   */
  @HostListener('document:scroll')
  onScroll() {
    this.closeMenu();
  }

  /**
   * Creates and displays the context menu at specified coordinates
   * @param x - X coordinate (cursor position)
   * @param y - Y coordinate (cursor position)
   */
  private createMenu(x: number, y: number) {
    console.log("creating menu at", x , y);
    console.log("menu count", this.menuItems.length);
    
    // Step 1: Create transparent backdrop to capture outside clicks
    this.backdropElement = this.renderer.createElement('div');
    this.renderer.addClass(this.backdropElement, 'context-menu-backdrop');
    this.renderer.appendChild(document.body, this.backdropElement);

    // Step 2: Create menu container
    this.menuElement = this.renderer.createElement('div');
    this.renderer.addClass(this.menuElement, 'context-menu');
    this.renderer.setStyle(this.menuElement, 'position', 'fixed');
    this.renderer.setStyle(this.menuElement, 'left', `${x}px`);
    this.renderer.setStyle(this.menuElement, 'top', `${y}px`);
    this.renderer.setStyle(this.menuElement, 'z-index', '1250');

    // Step 3: Create each menu item
    this.menuItems.forEach(item => {
      this.createMenuItem(item);
    });

    // Step 4: Add menu to page
    this.renderer.appendChild(document.body, this.menuElement);

    // Step 5: Adjust position if menu goes outside viewport
    this.adjustMenuPosition();
  }

  /**
   * Creates a single menu item with icon and label
   * @param item - Menu item configuration
   */
  private createMenuItem(item: ContextMenuItem) {
    // Create menu item container
    const menuItem = this.renderer.createElement('div');
    this.renderer.addClass(menuItem, 'context-menu-item');

    // Add disabled class if item is disabled
    if (item.disabled) {
      this.renderer.addClass(menuItem, 'disabled');
    }

    // Add icon if provided
    if (item.icon) {
      const icon = this.renderer.createElement('i');
      // Split icon class string and add each class (e.g., 'uil uil-edit-alt')
      const iconClasses = item.icon.split(' ');
      iconClasses.forEach(className => {
        this.renderer.addClass(icon, className);
      });
      this.renderer.appendChild(menuItem, icon);
    }

    // Add label text
    const label = this.renderer.createElement('span');
    const text = this.renderer.createText(item.label);
    this.renderer.appendChild(label, text);
    this.renderer.appendChild(menuItem, label);

    // Add click handler (only if not disabled)
    if (!item.disabled) {
      this.renderer.listen(menuItem, 'click', (e) => {
        e.stopPropagation();  // Prevent event bubbling
        item.action(this.contextMenuData);  // Execute the action
        this.closeMenu();  // Close menu after action
      });
    }

    // Add item to menu
    this.renderer.appendChild(this.menuElement, menuItem);
  }

  /**
   * Adjusts menu position if it goes outside viewport boundaries
   * Moves menu left/up if needed to keep it fully visible
   */
  private adjustMenuPosition() {
    if (!this.menuElement) return;

    const rect = this.menuElement.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Adjust horizontal position if menu extends beyond right edge
    if (rect.right > viewportWidth) {
      const newLeft = viewportWidth - rect.width - 5;
      this.renderer.setStyle(this.menuElement, 'left', `${newLeft}px`);
    }

    // Adjust vertical position if menu extends beyond bottom edge
    if (rect.bottom > viewportHeight) {
      const newTop = viewportHeight - rect.height - 5;
      this.renderer.setStyle(this.menuElement, 'top', `${newTop}px`);
    }
  }

  /**
   * Removes menu and backdrop from DOM
   */
  private closeMenu() {
    if (this.menuElement) {
      this.renderer.removeChild(document.body, this.menuElement);
      this.menuElement = null;
    }
    if (this.backdropElement) {
      this.renderer.removeChild(document.body, this.backdropElement);
      this.backdropElement = null;
    }
  }

  /**
   * Cleanup when directive is destroyed
   */
  ngOnDestroy() {
    this.closeMenu();
  }

}
