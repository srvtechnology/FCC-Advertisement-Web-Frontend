import {useNavigate, useParams} from "react-router-dom";
import {useEffect, useState} from "react";
import axiosClient from "../axios-client.js";
import {useStateContext} from "../context/ContextProvider.jsx";

export default function SpaceEntryForm() {
  const navigate = useNavigate();
  let {id} = useParams();
  const [space, setSpace] = useState({
    id: null,
    data_collection_date: '',
    name_of_person_collection_data: '',
    name_of_advertise_agent_company_or_person: '',
    name_of_contact_person: '',
    telephone: '',
    email: '',
    location: '',
    stree_rd_no: '',
    section_of_rd: '',
    landmark: '',
    gps_cordinate: '',
    description_property_advertisement: '',
    advertisement_cat_desc: '',
    type_of_advertisement: '',
    position_of_billboard: '',
    lenght_advertise: '',
    width_advertise: '',
    area_advertise: '',
    no_advertisement_sides: '',
    clearance_height_advertise: '',
    illuminate_nonilluminate: '',
    certified_georgia_licensed: '',
    landowner_company_corporate: '',
    landowner_name: '',
    landlord_street_address: '',
    landlord_telephone: '',
    landlord_email: '',
  })
  const [errors, setErrors] = useState(null)
  const [loading, setLoading] = useState(false)
  const {setNotification} = useStateContext()

  if (id) {
    useEffect(() => {
      setLoading(true)
      axiosClient.get(`/space/${id}`)
        .then(({data}) => {
          setLoading(false)
          setSpace(data)
        })
        .catch(() => {
          setLoading(false)
        })
    }, [])
  }

  const onSubmit = ev => {
    ev.preventDefault()
    if (space.id) {
      axiosClient.put(`/space/${space.id}`, space)
        .then(() => {
          setNotification('Space was successfully updated')
          navigate('/space')
        })
        .catch(err => {
          const response = err.response;
          if (response && response.status === 422) {
            setErrors(response.data.errors)
          }
        })
    } else {
      axiosClient.post('/space', space)
        .then(() => {
          setNotification('Space was successfully created')
          navigate('/space')
        })
        .catch(err => {
          const response = err.response;
          if (response && response.status === 422) {
            setErrors(response.data.errors)
          }
        })
    }
  }

  return (
    <>
      {space.id && <h1>Update Space: {space.name}</h1>}
      {!space.id && <h1>Add Space</h1>}
      <div className="card animated fadeInDown">
        {loading && (
          <div className="text-center">
            Loading...
          </div>
        )}
        {errors &&
          <div className="alert">
            {Object.keys(errors).map(key => (
              <p key={key}>{errors[key][0]}</p>
            ))}
          </div>
        }
        {!loading && (
          <form onSubmit={onSubmit}>
            <h3>Basic Information :</h3>
            <input value={space.data_collection_date} onChange={ev => setSpace({...space, data_collection_date: ev.target.value})} placeholder="Data Collection Date"/>
            <input value={space.name_of_person_collection_data} onChange={ev => setSpace({...space, name_of_person_collection_data: ev.target.value})} placeholder="Name of Person in Collection Data"/>
            <input value={space.name_of_advertise_agent_company_or_person} onChange={ev => setSpace({...space, name_of_advertise_agent_company_or_person: ev.target.value})} placeholder="Name of Advertisement Agent/Company/Person"/>
            <input value={space.name_of_contact_person} onChange={ev => setSpace({...space, name_of_contact_person: ev.target.value})} placeholder="Name of Contact Person"/>
            <input value={space.telephone} onChange={ev => setSpace({...space, telephone: ev.target.value})} placeholder="Telephone"/>
            <input value={space.email} onChange={ev => setSpace({...space, email: ev.target.value})} placeholder="Email"/>
            <h3>Advertisement Identification Information :</h3>
            <input value={space.location} onChange={ev => setSpace({...space, location: ev.target.value})} placeholder="Location"/>
            <input value={space.stree_rd_no} onChange={ev => setSpace({...space, stree_rd_no: ev.target.value})} placeholder="Stree/Road Number"/>
            <input value={space.section_of_rd} onChange={ev => setSpace({...space, section_of_rd: ev.target.value})} placeholder="Section of Road"/>
            <input value={space.landmark} onChange={ev => setSpace({...space, landmark: ev.target.value})} placeholder="Landmark"/>
            <input value={space.gps_cordinate} onChange={ev => setSpace({...space, gps_cordinate: ev.target.value})} placeholder="GPS Cordinate"/>
            <h3>Advertisement Details :</h3>
            <input value={space.description_property_advertisement} onChange={ev => setSpace({...space, description_property_advertisement: ev.target.value})} placeholder="Description of property on which advertisement will be situated"/>
            <input value={space.advertisement_cat_desc} onChange={ev => setSpace({...space, advertisement_cat_desc: ev.target.value})} placeholder="Advertisement Category description"/>
            <input value={space.type_of_advertisement} onChange={ev => setSpace({...space, type_of_advertisement: ev.target.value})} placeholder="Type of advertisement"/>
            <input value={space.position_of_billboard} onChange={ev => setSpace({...space, position_of_billboard: ev.target.value})} placeholder="Position of billboard"/>
            <input value={space.lenght_advertise} onChange={ev => setSpace({...space, lenght_advertise: ev.target.value})} placeholder="Advertisement Lengh"/>
            <input value={space.width_advertise} onChange={ev => setSpace({...space, width_advertise: ev.target.value})} placeholder="Advertisement Width"/>
            <input value={space.area_advertise} onChange={ev => setSpace({...space, area_advertise: ev.target.value})} placeholder="Advertisement Area"/>
            <input value={space.no_advertisement_sides} onChange={ev => setSpace({...space, no_advertisement_sides: ev.target.value})} placeholder="Number of advertisement sides"/>
            <input value={space.clearance_height_advertise} onChange={ev => setSpace({...space, clearance_height_advertise: ev.target.value})} placeholder="Clearance Height of the advertisement"/>
            <input value={space.illuminate_nonilluminate} onChange={ev => setSpace({...space, illuminate_nonilluminate: ev.target.value})} placeholder="Illuminated or Non-illuminated"/>
            <input value={space.illuminate_nonilluminate} onChange={ev => setSpace({...space, animated_nonanimated: ev.target.value})} placeholder="Animated or Non-Animated"/>
            <input value={space.certified_georgia_licensed} onChange={ev => setSpace({...space, certified_georgia_licensed: ev.target.value})} placeholder="Does your application include a certified drawing from a Georgia licensed surveyor showing that all setback requirements have been met from existing outdoor advertising signs, schools, public areas or buildings, monuments, or structures? "/>
            <h3>Landowner (if different from applicant) :</h3>
            <input value={space.landowner_company_corporate} onChange={ev => setSpace({...space, landowner_company_corporate_name: ev.target.value})} placeholder="Name of company / Corporate / other juristic person"/>
            <input value={space.landowner_name} onChange={ev => setSpace({...space, landowner_name: ev.target.value})} placeholder="Name of landowner"/>
            <input value={space.landlord_street_address} onChange={ev => setSpace({...space, landlord_street_address: ev.target.value})} placeholder="Street address"/>
            <input value={space.landlord_telephone} onChange={ev => setSpace({...space, landlord_telephone: ev.target.value})} placeholder="Telephone number"/>
            <input value={space.landlord_email} onChange={ev => setSpace({...space, landlord_email: ev.target.value})} placeholder="Email"/>
            <button className="btn">Save</button>
          </form>
        )}
      </div>
    </>
  )
}
