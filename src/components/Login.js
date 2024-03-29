import React,{useState} from 'react'
import { useNavigate } from 'react-router-dom'

const Login = (props) => {

  const [credential, setcredential] = useState({email:"",password:""} )
  let history = useNavigate()

  const handleSubmit =async (e) =>{
    e.preventDefault();
    const response = await fetch("http://localhost:5000/api/auth/login", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({email:credential.email,password:credential.password})
    });
    const json = await response.json()
    console.log(json)
    //matching the credential
    if(json.sucess){
      //save the auth token and redirect
      localStorage.setItem('token',json.authtoken)
      props.showAlert("logged in Successfully" , "success")
      history("/")
    }else{
      props.showAlert("Invalid details", "danger")
    }

  }
  const onChange = (e) => {
    setcredential({ ...credential, [e.target.name]: e.target.value })
  }
  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="email" className="form-label">Email address</label>
          <input type="email" className="form-control" value={credential.email} onChange={onChange} id="email" name = "email" aria-describedby="emailHelp"/>
        </div>
        <div className="mb-3">
          <label htmlFor="password" className="form-label">Password</label>
          <input type="password" className="form-control" value={credential.password} onChange={onChange} id="password" name='password'/>
        </div>
        <button type="submit" className="btn btn-primary" >Submit</button>
      </form>
    </div>
  )
}

export default Login