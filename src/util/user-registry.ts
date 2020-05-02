import { ActivityMetrics, ActivityMetricsRequest, RegionCompletion } from "../protobuf-gen/user-registry_pb"
import { UserRegistryClient } from "../protobuf-gen/user-registry_grpc_pb";
import { DiscoveredRegion } from "../state/model";
import { credentials } from "grpc";

const { USER_REGISTRY_SERVICE_URL } = process.env

const client = new UserRegistryClient(USER_REGISTRY_SERVICE_URL!, credentials.createInsecure())

export const pushActivityMetricRPC = (request: ActivityMetricsRequest) =>
    new Promise<ActivityMetrics>((resolve, reject) => {
        client.pushActivityMetrics(request, (err, res) => {
            if (err) reject(err)
            else resolve(res)
        })
    })

export const pushActivity = (
    userid: number,
    steps: number,
    distance: number,
    points: number,
    regions: DiscoveredRegion[]
) => {
    const request = new ActivityMetricsRequest()
    request.setId(userid)

    const metrics = new ActivityMetrics()
    metrics.setDistance(distance)
    metrics.setPoints(points)
    metrics.setSteps(steps)
    request.setMetrics(metrics)

    const regionList = regions.map(({ id, completion }) => {
        const region = new RegionCompletion()
        region.setId(id)
        region.setCompletion(completion)
        return region
    })
    request.setRegionsList(regionList)

    return pushActivityMetricRPC(request)
}