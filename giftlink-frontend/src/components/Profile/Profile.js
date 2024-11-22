import React, {useEffect, useState} from "react"
import {useNavigate} from "react-router-dom"
import {urlConfig} from '../../config'
import {useAppContext} from '../../context/AuthContext'

import './Profile.css'

const Profile = () => {
    const [userDetails, setUserDetails] = useState({})
    const [updatedDetails, setUpdatedDetails] = useState({})
    const [changed, setChanged] = useState("")
    const [editMode, setEditMode] = useState(false)

    const {setUserName} = useAppContext()

    const navigate = useNavigate()

    const changeStyle = {
        color: 'green',
        height: '.5cm',
        display: 'block',
        fontStyle: 'italic',
        fontSize: '12px'
    }

    useEffect(() => {
        const authToken = sessionStorage.getItem("auth-token")
        if (!authToken) {
            navigate("/app/login")
        } else {
            fetchUserProfile()
        }
    }, [navigate])

    const fetchUserProfile = async () => {
        try {
            const authToken = sessionStorage.getItem("auth-token")
            const email = sessionStorage.getItem("email")
            const name = sessionStorage.getItem('name')

            if (name || authToken) {
                const storedUserDetails = {
                    name: name,
                    email: email
                }

                setUserDetails(storedUserDetails)
                setUpdatedDetails(storedUserDetails)
            }
        } catch (error) {
            console.error(error)
        }
    }

    const handleEdit = () => {
        setEditMode(true)
    }

    const handleInputChange = (e) => {
        setUpdatedDetails({
            ...updatedDetails,
            [e.target.name]: e.target.value,
        })
    }
    const handleSubmit = async (e) => {
        e.preventDefault()

        try {
            const authToken = sessionStorage.getItem("auth-token")
            const email = sessionStorage.getItem("email")

            if (!authToken || !email) {
                navigate("/app/login")
                return
            }

            const payload = {...updatedDetails}

            const response = await fetch(`${urlConfig.backendUrl}/api/auth/update`, {
                method: "PUT",
                headers: {
                    "Authorization": `Bearer ${authToken}`,
                    "Content-Type": "application/json",
                    "Email": email,
                },
                body: JSON.stringify(payload)
            })

            if (response.ok) {
                setUserName(updatedDetails.name)
                sessionStorage.setItem("name", updatedDetails.name)
                setUserDetails(updatedDetails)
                setEditMode(false)

                setChanged("Name Changed Successfully!")

                setTimeout(() => {
                    setChanged("")
                    navigate("/")
                }, 1000)
            } else {
                throw new Error("Failed to update profile")
            }
        } catch (error) {
            console.error(error)
        }
    }

    return (
        <div className="profile-container">
            {editMode ? (
                <form onSubmit={handleSubmit}>
                    <label>
                        Email
                        <input
                            type="email"
                            name="email"
                            value={userDetails.email}
                            disabled // Disable the email field
                        />
                    </label>
                    <label>
                        Name
                        <input
                            type="text"
                            name="name"
                            value={updatedDetails.name}
                            onChange={handleInputChange}
                        />
                    </label>

                    <button type="submit">Save</button>
                </form>
            ) : (
                <div className="profile-details">
                    <h1>Hi, {userDetails.name}</h1>
                    <p><b>Email:</b> {userDetails.email}</p>
                    <button onClick={handleEdit}>Edit</button>
                    <span style={changeStyle}>{changed}</span>
                </div>
            )}
        </div>
    )
}

export default Profile
