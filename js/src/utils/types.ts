export interface ControlPoint {
  lightener: number; // 1-100
  target: number; // 0-100
}

export interface LightCurve {
  entityId: string;
  friendlyName: string;
  controlPoints: ControlPoint[];
  visible: boolean;
  color: string;
}

/** Minimal subset of the Home Assistant `hass` object used by this card. */
export interface Hass {
  user: { is_admin: boolean };
  callWS: <T>(msg: Record<string, unknown>) => Promise<T>;
  callService: (domain: string, service: string, data?: Record<string, unknown>) => Promise<void>;
  states: Record<
    string,
    { attributes: { friendly_name?: string; brightness?: number }; state: string }
  >;
}
