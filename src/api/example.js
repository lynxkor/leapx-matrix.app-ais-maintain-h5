import { post } from './request.js'

export function getList(data) {
  return post('/datacenter/vehiclePartsMaintenance/page', data)
}
