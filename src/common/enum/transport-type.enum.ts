/**
 * TransportType — categories of transport hubs in the city.
 *
 * Used to filter and display transport locations by type.
 */
export enum TransportType {
  /** International or domestic airport */
  AIRPORT = 'airport',

  /** Railway / train station */
  TRAIN_STATION = 'train_station',

  /** Intercity or local bus terminal */
  BUS_STATION = 'bus_station',

  /// Taxi service
  TAXI = 'taxi',
}
