const socket = io()

//Elements
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $sendLocationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')

//Templates

const messageTemplate = document.querySelector('#message-template').innerHTML
const locationMessageTemplate = document.querySelector('#locationLink-template').innerHTML
const sidebarTemplate =  document.querySelector('#sidebar-template').innerHTML

//options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })

const autoscroll = () => {
           // new message element
    const $newMessage = $messages.lastElementChild 
         
         // Height of new message
     const newMessageStyles = getComputedStyle($newMessage)
     const newMessageMargin = parseInt(newMessageStyles.marginBottom) 
     const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

         //visible height
     const visibleHeight = $messages.offsetHeight
     
        // Height of messages container
     const containerHeight = $messages.scrollHeight
     
        // How far have I scrolled
     const scrollOffset =  $messages.scrollTop + visibleHeight
     
     if(containerHeight - newMessageHeight <= scrollOffset) {
          $messages.scrollTop = $messages.scrollHeight
     }

}

socket.on('message', (message) => {
       console.log(message)
       const html = Mustache.render(messageTemplate, {
              username: message.username,
              message: message.text,
              createdAt: moment(message.createdAt).format('h:mm a') 
       })
       $messages.insertAdjacentHTML('beforeend', html)
       autoscroll()
})

socket.on('locationMessage', (locObj) => {
       console.log(`Location: ${locObj.url}`)
       const html = Mustache.render(locationMessageTemplate, {
              username: locObj.username,
              url: locObj.url,
              createdAt: moment(locObj.createdAt).format('h:mm a')
       })
       $messages.insertAdjacentHTML('beforeend', html)
       autoscroll()
})

socket.on('roomData', ({ room, users }) => {
       const html = Mustache.render(sidebarTemplate, {
              room,
              users
       })
       document.querySelector('#sidebar').innerHTML = html
})

document.querySelector('#message-form').addEventListener('submit', (e) => {
       e.preventDefault()
       const message = e.target.elements.message.value

       $messageFormButton.setAttribute('disabled', 'disabled')

       socket.emit('sendMessage', message , (error) => {
              $messageFormButton.removeAttribute('disabled')
              $messageFormInput.value = ''
              $messageFormInput.focus()

              if(error) {
            return console.log(error)
          }  
           
          console.log('message was delivered')
       })
})


document.querySelector('#send-location').addEventListener('click', () => {
    if(!navigator.geolocation) {
        return alert('Geolocation is not supported by your browser')
    }
       $sendLocationButton.setAttribute('disabled', 'disabled')

    navigator.geolocation.getCurrentPosition((position) => {
           console.log(position)

           socket.emit('sendLocation', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
           }, 
           () => {  
              $sendLocationButton.removeAttribute('disabled')
              console.log('location shared')       
           })
    })
})

socket.emit('join', { username, room}, (error) => {
      if(error) {
       alert(error)
       location.href = '/'
      }
})

