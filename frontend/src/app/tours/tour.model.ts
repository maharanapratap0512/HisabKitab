export interface TourStepAction {
  type: 'click' | 'open_modal' | 'close_modal' | 'select_checkbox' | 'select_row' | 'toggle_hl' | 'navigate' | 'close_hover' | 'add_class' | 'remove_class' | 'close_select';
  target?: string;
  className?: string;
  delayMs?: number;
}



export interface TourStepConfig {
  element: string;
  popover: {
    title: string;
    description: string;
    side?: 'top' | 'bottom' | 'left' | 'right';
    align?: 'start' | 'center' | 'end';
  };
  beforeShowAction?: TourStepAction | TourStepAction[];
  afterHideAction?: TourStepAction | TourStepAction[];
}

export interface ComponentTourGroup {
  id: string;
  pageTitle: string;
  masterSteps: TourStepConfig[];
  miniTours?: {
    id: string;
    title: string;
    stepIndexes: number[];
  }[];
}
