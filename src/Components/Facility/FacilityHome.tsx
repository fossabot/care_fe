import { Button, Card, CardContent, Divider, Grid, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { navigate } from "hookrouter";
import React, { useCallback, useState } from "react";
import { useDispatch } from "react-redux";
import { BED_TYPES, DOCTOR_SPECIALIZATION } from "../../Common/constants";
import { statusType, useAbortableEffect } from "../../Common/utils";
import { getFacility, listCapacity, listDoctor, getTriageInfo } from "../../Redux/actions";
import * as Notification from "../../Utils/Notifications.js";
import { Loading } from "../Common/Loading";
import PageTitle from "../Common/PageTitle";
import BedTypeCard from "./BedTypeCard";
import DoctorsCountCard from "./DoctorsCountCard";
import { CapacityModal, DoctorModal, FacilityModal, PatientStatsModel } from "./models";
import moment from "moment";

const useStyles = makeStyles(theme => ({
  root: {
    flexGrow: 1,
    padding: "8px"
  },
  margin: {
    margin: theme.spacing(1)
  },
  displayFlex: {
    display: "flex"
  },
  content: {
    marginTop: "10px",
    maxWidth: "560px",
    background: "white",
    padding: "20px 20px 5px"
  }
}));

export const FacilityHome = (props: any) => {
  const { facilityId } = props;
  const classes = useStyles();
  const dispatch: any = useDispatch();
  const [facilityData, setFacilityData] = useState<FacilityModal>({});
  const [capacityData, setCapacityData] = useState<Array<CapacityModal>>([]);
  const [doctorData, setDoctorData] = useState<Array<DoctorModal>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [patientStatsData, setPatientStatsData] = useState<PatientStatsModel>({});

  const fetchData = useCallback(
    async (status: statusType) => {
      setIsLoading(true);
      const [facilityRes, capacityRes, doctorRes, triageRes] = await Promise.all([
        dispatch(getFacility(facilityId)),
        dispatch(listCapacity({}, { facilityId })),
        dispatch(listDoctor({}, { facilityId })),
        dispatch(getTriageInfo({ facilityId })),
      ]);
      if (!status.aborted) {
        setIsLoading(false);
        if (!facilityRes.data) {
          Notification.Error({
            msg: "Something went wrong..!"
          });
        } else {
          setFacilityData(facilityRes.data);
          if (capacityRes && capacityRes.data) {
            setCapacityData(capacityRes.data.results);
          }
          if (doctorRes && doctorRes.data) {
            setDoctorData(doctorRes.data.results);
          }
          if (triageRes && triageRes.data) {
            setPatientStatsData(triageRes.data.results[0]);
          }
        }
      }
    },
    [dispatch, facilityId]
  );

  useAbortableEffect(
    (status: statusType) => {
      fetchData(status);
    },
    [dispatch, fetchData]
  );

  if (isLoading) {
    return <Loading />;
  }

  let capacityList: any = null;
  if (!capacityData || !capacityData.length) {
    capacityList = <h5>No Bed Types Found</h5>;
  } else {
    capacityList = capacityData.map((data: CapacityModal) => {
      return (
        <BedTypeCard facilityId={facilityId} key={`bed_${data.id}`} {...data} />
      );
    });
  }

  let doctorList: any = null;
  if (!doctorData || !doctorData.length) {
    doctorList = <h5>No Doctors Found</h5>;
  } else {
    doctorList = doctorData.map((data: DoctorModal) => {
      return (
        <DoctorsCountCard
          facilityId={facilityId}
          key={`bed_${data.id}`}
          {...data}
        />
      );
    });
  }

  return (
    <div className="px-2">
      <PageTitle title="Facility" />
      <Card className="mt-4">
        <CardContent>
          <Grid
            container
            style={{ padding: "10px", marginBottom: "5px" }}
            spacing={2}
          >
            <Grid item xs={12} md={7}>
              <Typography
                style={{ textTransform: "capitalize" }}
                variant="h6"
                component="h6"
              >
                {facilityData.name}
              </Typography>
              <Typography>Address : {facilityData.address}</Typography>
              <Typography>Phone : {facilityData.phone_number}</Typography>
              <Typography>
                District : {facilityData?.district_object?.name}
              </Typography>
              <Typography>
                Oxygen Capacity :{` ${facilityData.oxygen_capacity} Litres`}
              </Typography>
            </Grid>
            <Grid item xs={12} md={5}>
              <Grid container spacing={1} direction="column">
                <Grid item xs={12} className="w3-center">
                  <Button
                    fullWidth
                    variant="contained"
                    color="primary"
                    size="small"
                    onClick={() => navigate(`/facility/${facilityId}/update`)}
                  >
                    Update Hospital Info
              </Button>
                </Grid>
                <Grid item xs={12} className="w3-center">
                  <Button
                    fullWidth
                    variant="contained"
                    color="primary"
                    size="small"
                    onClick={() => navigate(`/facility/${facilityId}/bed`)}
                    disabled={capacityList.length === BED_TYPES.length}
                  >
                    Add More Bed Types
              </Button>
                </Grid>
                <Grid item xs={12} className="w3-center">
                  <Button
                    fullWidth
                    variant="contained"
                    color="primary"
                    size="small"
                    onClick={() => navigate(`/facility/${facilityId}/doctor`)}
                    disabled={doctorList.length === DOCTOR_SPECIALIZATION.length}
                  >
                    Add More Doctor Types
              </Button>
                </Grid>
                <Grid item xs={12} className="w3-center">
                  <Button
                    fullWidth
                    variant="contained"
                    color="primary"
                    size="small"
                    onClick={() => navigate(`/facility/${facilityId}/triage`)}
                  >
                    Add Triage
                  </Button>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
          <Grid container style={{ padding: "10px" }} spacing={1}>
            <Grid item xs={12} md={6} className="w3-center">
              <Button
                fullWidth
                variant="contained"
                color="primary"
                size="small"
                onClick={() => navigate(`/facility/${facilityId}/patient`)}
              >
                Add Details of Covid Suspects
          </Button>
            </Grid>
            <Grid item xs={12} md={6} className="w3-center">
              <Button
                fullWidth
                variant="contained"
                color="primary"
                size="small"
                onClick={() => navigate(`/facility/${facilityId}/patients`)}
              >
                View Suspects / Patients
          </Button>
            </Grid>
          </Grid>
          <Grid container style={{ padding: "10px" }} spacing={1}>
            <Grid item xs={12}>
              <table className="w3-table-all w3-centered">
                <thead>
                  <tr className="w3-light-grey">
                    <th>Date of Entry</th>
                    <th>TOTAL PATIENT VISITED IN CORONA TRAIGE</th>
                    <th>TOTAL NO.OF PATIENT ADVISED HOME QUARANTINE</th>
                    <th>TOTAL NO.OF PATIENTS UNDER ISOLATION</th>
                    <th>TOTAL OF PATIENTS REFFERED</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{patientStatsData.entry_date || ''}</td>
                    <td>{patientStatsData.num_patients_visited || ''}</td>
                    <td>{patientStatsData.num_patients_home_quarantine || ''}</td>
                    <td>{patientStatsData.num_patients_isolation || ''}</td>
                    <td>{patientStatsData.num_patient_referred || ''}</td>
                  </tr>
                </tbody>
              </table>
            </Grid>
          </Grid>
          
          <Grid
            container
            style={{ padding: "10px", marginBottom: "15px" }}
            spacing={1}
          >
            <Grid item xs={12} md={12}>
              <h5>Bed Types</h5>
              <Divider />
            </Grid>
            {capacityList}
          </Grid>
          <Grid
            container
            style={{ padding: "10px", marginBottom: "15px" }}
            spacing={1}
          >
            <Grid item xs={12} md={12}>
              <h5>Doctors Count</h5>
              <Divider />
            </Grid>
            {doctorList}
          </Grid>
        </CardContent>
      </Card>
    </div>
  );
};